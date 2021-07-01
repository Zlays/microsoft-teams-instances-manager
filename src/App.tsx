import React, { useEffect, useState } from "react";
import fs from "fs";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import "./App.global.css";
import { profilesPath } from "./utils/ResourcesPath";

const Main = () => {

	const [profiles, setProfiles] = useState([]);
	const [profileNameBox, setProfileNameBox] = useState("");

	//reset all
	useEffect(()=>{
		setProfiles(() => []);
		setProfileNameBox(()=> "")
	},[])


	useEffect(() => {

		fs.readdir(profilesPath, function(err, files) {
			if (err) {
				return console.debug("Unable to scan directory:", err);
			}
			files.forEach(function(file) {
				if (fs.lstatSync(profilesPath.concat("\\", file)).isDirectory()) {
					setProfiles((profiles) => [...profiles, file]);
					console.debug("profile loaded:", file);
				}
			});
		});
	}, []);

	function addProfile() {
		const dir = profilesPath.concat("\\", profileNameBox);

		if (!profileNameBox) {
			return;
		}

		if (profiles.includes(profileNameBox)) {
			alert(`Profile with name ${profileNameBox} already exists`);
			return;
		}

		fs.mkdir(dir, (err) => {
			if (err) {
				return console.error(err);
			}
			setProfiles((profiles) => [...profiles, profileNameBox]);
			console.debug("Directory created successfully: ", dir);
		});
		console.debug("profile added: ", profileNameBox);
	}

	function handleProfileNameBox({ target }) {
		setProfileNameBox(() => target.value);
	}

	return (
		<div>
			<div>
				<input
					type="text"
					name="profileNameBox"
					placeholder="Enter profile name here..."
					value={profileNameBox}
					onChange={handleProfileNameBox}
				/>
				<button onClick={addProfile}> add profile</button>
			</div>
			<div>
				{profiles.map((profile) => (
					<React.Fragment key={profile}>
						<p> {profile} </p>
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
