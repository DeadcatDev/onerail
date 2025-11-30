import type { Persistence } from '../types';

const impl: Persistence = require('./sequelize');

export = impl;
