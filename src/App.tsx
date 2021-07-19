import React, { useEffect, useState } from 'react';
import fs from 'fs';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './App.global.css';
import { spawn } from 'child_process';
import AutoLaunch from 'auto-launch';
import { configPath, profilesPath, teamsPath } from './utils/ResourcesPath';
import Profile from './components/Profile';
import Button from './components/Button';
import ErrorBox from './components/ErrorBox';
import Logger from './utils/Logger';
import inputValidator from './utils/Validator';
import packageJSON from './package.json';
import { Row } from './components/FlexCSS';

const AutoLauncher = new AutoLaunch({
  name: packageJSON.name,
  author: packageJSON.author,
});

interface Settings {
  onStartup: boolean;
  autoLaunch: boolean;
}

const Main = () => {
  const [settings, setSettings] = useState<Settings>();
  const [error, setError] = useState('');
  const [profiles, setProfiles] = useState([]);
  const [profileNameBox, setProfileNameBox] = useState('');

  function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

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
  }

  function onRun(profile) {
    spawn('powershell', [`start ${teamsPath}\\current\\Teams.exe`], {
      env: { USERPROFILE: profilesPath.concat('\\', profile) },
    });
    Logger(`${profile} is started!`);
  }

  function loadConfig(): boolean {
    let data: string;
    let json: Settings;
    try {
      data = fs.readFileSync(configPath.concat('\\file.config'), 'utf8');
    } catch (err) {
      json = {
        onStartup: true,
        autoLaunch: true,
      };
      Logger(`error loading configurations: ${err}`, 'error');
    }
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
    return json.onStartup;
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

    AutoLauncher.isEnabled()
      .then((isEnabled: boolean) => {
        if (isEnabled && !settings.autoLaunch) {
          AutoLauncher.disable();
        } else if (!isEnabled && settings.autoLaunch) {
          AutoLauncher.enable();
        }
        return !isEnabled;
      })
      .catch((err) => {
        Logger(err, 'error');
      });
  }, [settings]);

  useEffect(() => {
    init();
    const checked = loadConfig();

    fs.readdir(profilesPath, (err, files) => {
      if (err) {
        return Logger(err, 'error');
      }
      files.forEach((file) => {
        if (fs.lstatSync(profilesPath.concat('\\', file)).isDirectory()) {
          setProfiles((preValues) => [...preValues, file]);

          if (checked) onRun(file);
          Logger(`profile loaded: ${file}`);
        }
      });
      return Logger('profile loader ended');
    });
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
    fs.rmdir(profilesPath.concat('\\', profile), { recursive: true }, (err) => {
      if (err) {
        showError('Please close Teams before deleting the profile');
        return;
      }
      setProfiles((preValues) =>
        preValues.filter((value) => value !== profile)
      );
      Logger(`${profile} is deleted!`);
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
export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={Main} />
      </Switch>
    </Router>
  );
}
