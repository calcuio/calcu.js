import {types} from '../index';
import fs from 'fs';

fs.writeFileSync('./src/type-definitions/json/types.json', JSON.stringify(types, null, 4));
