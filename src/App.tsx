import React, { useEffect, useState } from 'react';
import fs from 'fs';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './App.global.css';
import { spawn } from 'child_process';
import { profilesPath, teamsPath } from './utils/ResourcesPath';
import Profile from './components/Profile';
import Button from './components/Button';
import ErrorBox from './components/ErrorBox';
import Logger from './utils/Logger';
import inputValidator from './utils/Validator';

const Main = () => {
  const [error, setError] = useState('');
  const [profiles, setProfiles] = useState([]);
  const [profileNameBox, setProfileNameBox] = useState('');

  // reset all
  useEffect(() => {
    setError('');
    setProfiles([]);
    setProfileNameBox('');
  }, []);

  useEffect(() => {
    if (!fs.existsSync(profilesPath)) {
      fs.mkdir(profilesPath, (err) => {
        if (err) {
          return Logger(err, 'error');
        }
        return Logger('Profile directory created');
      });
    }

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
      return Logger('profile loader end');
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
    process.env.USERPROFILE = profilesPath.concat('\\', profile);
    spawn('powershell', [`start ${teamsPath}\\current\\Teams.exe`]);

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
