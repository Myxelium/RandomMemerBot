import { loadFiles } from './file-list.js';
import { updateAvoidList } from './avoid-list.js';
import { loadNextPlaybackTime } from './upload.js';

// Call loadFiles when the script is loaded
loadFiles();
loadNextPlaybackTime();
updateAvoidList();