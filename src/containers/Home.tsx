import React, { useEffect, useState } from 'react';
import fs from 'fs';
import { Settings, sleep } from '../utils/Utils';
import { configPath, profilesPath } from '../utils/ResourcesPath';
import Logger from '../utils/Logger';
import inputValidator from '../utils/Validator';
import ErrorBox from '../components/ErrorBox';
import { Row } from '../components/FlexCSS';
import Button from '../components/Button';
import Profile from '../components/Profile';
import sendAsync from '../services/OsReactService';

export const Home = () => {
  const [settings, setSettings] = useState<Settings>();
  const [error, setError] = useState('');
  const [profiles, setProfiles] = useState([]);
  const [profileNameBox, setProfileNameBox] = useState('');

  async function init() {
    setError('');
    setProfiles([]);
    setProfileNameBox('');

    await sleep(1250);

    if (!fs.existsSync(profilesPath)) {
      fs.mkdir(profilesPath, (err) => {
        if (err) {
          return Logger(err, 'error');
        }
        return Logger('Profile directory created');
      });
    }

    if (!fs.existsSync(configPath)) {
      fs.mkdir(configPath, (err) => {
        if (err) {
          return Logger(err, 'error');
        }
        return Logger('Config directory created');
      });
    }

    return sleep(1250);
  }

  function onRun(profile) {
    const dir = profilesPath.concat('\\', profile);
    const downloadDir = dir.concat('\\downloads');
    sendAsync('os-fs-mkdir', downloadDir);

    // Spawn
    sendAsync('spawn', settings)
      .then(() => {})
      .catch((err) => {
        showError(err);
      });

    Logger(`${profile} is started!`);
  }

  function loadConfig(): boolean {
    try {
      const configFile = configPath.concat('\\file.config');
      sendAsync('os-fs-read', configFile)
        .then((data) => {
          let json: Settings;
          if (!json) json = JSON.parse(data);
          if (!json) {
            setSettings({
              onStartup: true,
              autoLaunch: true,
            });
          }
          if (json.onStartup === null) json.onStartup = true;
          if (json.autoLaunch === null) json.onStartup = true;
          setSettings(json);
          Logger(`config loaded: ${JSON.stringify(json)}`);
        })
        .catch((err) => {
          showError(err);
        });
    } catch (err) {
      json = {
        onStartup: true,
        autoLaunch: true,
      };
      setSettings(json);
      Logger(`error loading configurations: ${err}`, 'error');
    }
  }

  useEffect(() => {
    if (!settings) return;

    fs.writeFile(
      configPath.concat('\\file.config'),
      JSON.stringify(settings),
      'utf8',
      (err) => {
        if (err) return Logger(err, 'error');
        return Logger('config updated');
      }
    );
  }, [settings]);

  useEffect(() => {
    init()
      .then(() => {
        fs.readdir(profilesPath, (err, files) => {
          if (err) {
            return Logger(err, 'error');
          }
          files.forEach((file) => {
            if (fs.lstatSync(profilesPath.concat('\\', file)).isDirectory()) {
              setProfiles((preValues) => [...preValues, file]);
              if (settings?.onStartup) onRun(file);
              Logger(`profile loaded: ${file}`);
            }
          });
          return Logger('profile loader ended');
        });

        return Logger('Init ended');
      })
      .catch((err) => Logger(err, 'error'));
  }, []);

  function showError(text) {
    setError(text);
    setTimeout(() => setError(''), 5000);
  }

  function addProfile() {
    const profileName = profileNameBox.trim();
    const dir = profilesPath.concat('\\', profileName);

    if (!profileName) {
      return;
    }

    if (profiles.includes(profileName)) {
      showError('Name of the profile already used');
      return;
    }

    fs.mkdir(dir, (err) => {
      if (err) {
        return Logger(err, 'error');
      }
      setProfiles((preValues) => [...preValues, profileName]);
      return Logger(`Directory created successfully: ${dir}`);
    });

    setProfileNameBox('');
    Logger(`profile added: ${profileName}`);
  }

  function handleProfileNameBox({ target }) {
    setProfileNameBox(() => inputValidator(target.value));
  }

  function onDelete(profile) {
    const profilePath = profilesPath.concat('\\', profile);
    sendAsync('os-fs-rmdir', profilePath)
      .then(() => {
        setProfiles((preValues) =>
          preValues.filter((value) => value !== profile)
        );
        Logger(`${profile} is deleted!`);
      })
      .catch((err) => {
        showError(err);
      });
  }

  function handleOnStartup({ target }) {
    setSettings((prevState: Settings) => {
      return {
        ...prevState,
        onStartup: target.checked,
      };
    });
    Logger(`onStartup setted to: ${target.checked}`);
  }

  function handleAutoLaunch({ target }) {
    setSettings((prevState: Settings) => {
      return {
        ...prevState,
        autoLaunch: target.checked,
      };
    });
    Logger(`onStartup setted to: ${target.checked}`);
  }

  return (
    <div>
      <ErrorBox text={error} />
      {settings ? (
        <Row>
          <label htmlFor="onStartup">
            <input
              id="onStartup"
              type="checkbox"
              onChange={handleOnStartup}
              checked={settings.onStartup}
            />
            Run instances on startup
          </label>
          <label htmlFor="autoLaunch">
            <input
              id="autoLaunch"
              type="checkbox"
              onChange={handleAutoLaunch}
              checked={settings.autoLaunch}
            />
            Run app on startup
          </label>
        </Row>
      ) : null}
      <div>
        <input
          type="text"
          name="profileNameBox"
          placeholder="Enter profile name here..."
          value={profileNameBox}
          onChange={handleProfileNameBox}
        />
        <Button text="Add profile" click={addProfile} />
      </div>

      {profiles.map((profile) => (
        <React.Fragment key={profile}>
          <Profile
            text={profile}
            onRun={() => onRun(profile)}
            onDelete={() => onDelete(profile)}
          />
        </React.Fragment>
      ))}
    </div>
  );
};
