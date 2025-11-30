import type { Persistence } from '../types';

// Always use MySQL via Sequelize ORM
const impl: Persistence = require('./sequelize');

export = impl;
