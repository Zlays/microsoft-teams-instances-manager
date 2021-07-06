import React, { useEffect, useState } from 'react';
import fs from 'fs';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './App.global.css';
import { spawn } from 'child_process';
import { configPath, profilesPath, teamsPath } from './utils/ResourcesPath';
import Profile from './components/Profile';
import Button from './components/Button';
import ErrorBox from './components/ErrorBox';
import Logger from './utils/Logger';
import inputValidator from './utils/Validator';

interface Settings {
  onStartup: boolean;
}

const Main = () => {
  const [settings, setSettings] = useState<Settings>();
  const [error, setError] = useState('');
  const [profiles, setProfiles] = useState([]);
  const [profileNameBox, setProfileNameBox] = useState('');

  function init() {
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

  useEffect(() => {
    if (!settings) return;

    fs.writeFile(
      configPath.concat('\\file.config'),
      JSON.stringify(settings),
      'utf8',
      function (err) {
        if (err) return Logger(err, 'error');
        return Logger('config updated');
      }
    );
  }, [settings]);

  useEffect(() => {
    setError('');
    setProfiles([]);
    setProfileNameBox('');
  }, []);

  useEffect(() => {
    init();

    // read config
    fs.readFile(configPath.concat('\\file.config'), 'utf8', function (
      err,
      data
    ) {
      if (err) {
        setSettings({
          onStartup: true,
        });
        Logger(err, 'error');
        return;
      }
      if (!data || data === 'null') {
        setSettings({
          onStartup: true,
        });
        return;
      }
      const json = JSON.parse(data);
      setSettings(json);
      Logger(`config loaded: ${json}`);
    });

    fs.readdir(profilesPath, function (err, files) {
      if (err) {
        return Logger(err, 'error');
      }
      files.forEach(function (file) {
        if (fs.lstatSync(profilesPath.concat('\\', file)).isDirectory()) {
          setProfiles((preValues) => [...preValues, file]);
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
    Logger(`profile added: ${profileName}`);
  }

  function handleProfileNameBox({ target }) {
    setProfileNameBox(() => inputValidator(target.value));
  }

  function onRun(profile) {
    spawn('powershell', [`start ${teamsPath}\\current\\Teams.exe`], {
      env: { USERPROFILE: profilesPath.concat('\\', profile) },
    });

    Logger(`${profile} is started!`);
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

  return (
    <div>
      <ErrorBox text={error} />
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
      <div>
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

      {settings ? (
        <label htmlFor="onStartup">
          <input
            id="onStartup"
            type="checkbox"
            onChange={handleOnStartup}
            checked={settings.onStartup}
          />
          Run on startup
        </label>
      ) : null}
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
