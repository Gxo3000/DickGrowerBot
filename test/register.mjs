// Routes the platform's `sdk` imports to the offline emulator in `test/sdk/`.

import { register } from 'node:module';

register('./resolver.mjs', import.meta.url);
