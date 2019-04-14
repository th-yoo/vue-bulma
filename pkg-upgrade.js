'use strict'

const pkg = require('./package.json');
// glob is vue dependency
const glob = require('glob');
const fs = require('fs');
const path = require('path');

const workspaces = pkg.workspaces;
const deps = Object.assign({}, pkg.devDependencies || {});
Object.assign(deps, pkg.dependencies || {});

//console.log(deps);

function upgrade(p_deps)
{
	let dirty = false;

	if (!p_deps) return dirty;

	for (let i in p_deps) {
		if (!deps[i]) continue;

		if (deps[i] !== p_deps[i]) {
			dirty = true;
			p_deps[i] = deps[i];
		}
	}

	return dirty;
}

for (let w of workspaces) {
	glob(w, (e, files)=> {
		//console.log(files);
		for (let p of files) {
			let pkg_path = path.join(p, 'package.json');
			if (!fs.existsSync(pkg_path)) continue;
			pkg_path = './'+pkg_path;

			const pkg = require(pkg_path);

			// N.B. avoid short ckt
			const d1 = upgrade(pkg.devDependencies);
			const d2 = upgrade(pkg.dependencies);

			if (d1 || d2) {
				console.log(`update: ${pkg_path}`);
				fs.writeFile(pkg_path, JSON.stringify(pkg, null, 2)+'\n', err=> {
					err && console.error(`${pkg_path}: ${err}`);
				});
			}
		}
	});
}
