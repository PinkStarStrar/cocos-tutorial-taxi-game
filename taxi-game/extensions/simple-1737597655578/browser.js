'use strict';

const Fs = require('fs');
const Path = require('path');
const Uuid = require('uuid');

module.exports = {
  load() {
    // Called when the package is loaded
    console.log('Simple package loaded');
  },

  unload() {
    // Called when the package is unloaded
  },

  messages: {
    'refresh-uuid'() {
      const assetsPath = Path.join(Editor.Project.path, 'assets');

      function refreshUUIDs(dir) {
        Fs.readdirSync(dir).forEach(file => {
          const fullPath = Path.join(dir, file);

          if (Fs.statSync(fullPath).isDirectory()) {
            refreshUUIDs(fullPath);
          } else if (file.endsWith('.meta')) {
            const metaContent = JSON.parse(Fs.readFileSync(fullPath, 'utf8'));
            metaContent.uuid = Uuid.v4();
            Fs.writeFileSync(fullPath, JSON.stringify(metaContent, null, 2), 'utf8');
            Editor.log(`Refreshed UUID for ${fullPath}`);
          }
        });
      }

      refreshUUIDs(assetsPath);
      Editor.success('All UUIDs have been refreshed.');
    }
  },
};