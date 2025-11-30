import {
    Sequelize,
    DataTypes,
    Model,
    InferAttributes,
    InferCreationAttributes,
} from 'sequelize';
import fs from 'fs';
import waitPort from 'wait-port';
import type { Persistence } from '../types';
import logger from '../logger';

const {
    MYSQL_HOST: HOST,
    MYSQL_HOST_FILE: HOST_FILE,
    MYSQL_USER: USER,
    MYSQL_USER_FILE: USER_FILE,
    MYSQL_PASSWORD: PASSWORD,
    MYSQL_PASSWORD_FILE: PASSWORD_FILE,
    MYSQL_DB: DB,
    MYSQL_DB_FILE: DB_FILE,
} = process.env;

let sequelize: Sequelize | undefined;

async function init(): Promise<void> {
    const host = HOST_FILE ? fs.readFileSync(HOST_FILE, 'utf8').trim() : HOST;
    const user = USER_FILE ? fs.readFileSync(USER_FILE, 'utf8').trim() : USER;
    const password = PASSWORD_FILE
        ? fs.readFileSync(PASSWORD_FILE, 'utf8').trim()
        : PASSWORD;
    const database = DB_FILE ? fs.readFileSync(DB_FILE, 'utf8').trim() : DB;

    if (!host || !user || !database) {
        throw new Error(
            'Missing MySQL connection details. Ensure MYSQL_HOST, MYSQL_USER, and MYSQL_DB are set.',
        );
    }

    // Wait for MySQL port to become available (especially important in Docker Compose)
    await waitPort({
        host,
        port: 3306,
        timeout: 30000,
        waitForDns: true,
    } as any);

    // Helper to initialize the Sequelize instance bound to the target database
    const initSequelizeWithDb = () =>
        new Sequelize(
            database as string,
            user as string,
            (password as string) || undefined,
            {
                host,
                dialect: 'mysql',
                logging: false,
            },
        );

    // Attempt to connect to the target DB; if it doesn't exist, create it first
    try {
        sequelize = initSequelizeWithDb();
        await sequelize.authenticate();
    } catch (err: any) {
        const msg = String(err?.message || '');
        const code = err?.original?.code || err?.code;
        const isUnknownDb =
            code === 'ER_BAD_DB_ERROR' || /Unknown database/i.test(msg);
        if (!isUnknownDb) throw err;

        // Connect to the server using the default 'mysql' database and create the target DB
        const serverLevel = new Sequelize(
            'mysql',
            user as string,
            (password as string) || undefined,
            {
                host,
                dialect: 'mysql',
                logging: false,
            },
        );
        try {
            await serverLevel.query(
                `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci`,
            );
        } finally {
            await serverLevel.close().catch(() => {});
        }

        // Recreate the connection bound to the target DB
        sequelize = initSequelizeWithDb();
        await sequelize.authenticate();
    }

    // New domain models per requirements: organization, user, order
    class OrganizationModel extends Model<
        InferAttributes<OrganizationModel>,
        InferCreationAttributes<OrganizationModel>
    > {
        declare id: string;
        declare name: string;
        declare industry: string | null;
        declare dateFounded: Date | null;
    }

    class UserModel extends Model<
        InferAttributes<UserModel>,
        InferCreationAttributes<UserModel>
    > {
        declare id: string;
        declare firstName: string;
        declare lastName: string;
        declare email: string;
        declare dateCreated: Date | null;
        declare organizationId: string;
    }

    class OrderModel extends Model<
        InferAttributes<OrderModel>,
        InferCreationAttributes<OrderModel>
    > {
        declare id: string;
        declare orderDate: Date | null;
        declare totalAmount: number;
        declare userId: string;
        declare organizationId: string;
    }

    OrganizationModel.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            name: { type: DataTypes.STRING(255), allowNull: false },
            industry: { type: DataTypes.STRING(255), allowNull: true },
            dateFounded: { type: DataTypes.DATE, allowNull: true },
        },
        { tableName: 'organizations', timestamps: false, sequelize },
    );

    UserModel.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            firstName: { type: DataTypes.STRING(255), allowNull: false },
            lastName: { type: DataTypes.STRING(255), allowNull: false },
            email: {
                type: DataTypes.STRING(255),
                allowNull: false,
                unique: true,
            },
            dateCreated: { type: DataTypes.DATE, allowNull: true },
            organizationId: { type: DataTypes.UUID, allowNull: false },
        },
        { tableName: 'users', timestamps: false, sequelize },
    );

    OrderModel.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            orderDate: { type: DataTypes.DATE, allowNull: false },
            totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
            userId: { type: DataTypes.UUID, allowNull: false },
            organizationId: { type: DataTypes.UUID, allowNull: false },
        },
        { tableName: 'orders', timestamps: false, sequelize },
    );

    // Associations
    OrganizationModel.hasMany(UserModel, {
        foreignKey: 'organizationId',
        constraints: false,
    });
    UserModel.belongsTo(OrganizationModel, {
        foreignKey: 'organizationId',
        constraints: false,
    });

    UserModel.hasMany(OrderModel, { foreignKey: 'userId', constraints: false });
    OrderModel.belongsTo(UserModel, {
        foreignKey: 'userId',
        constraints: false,
    });

    OrganizationModel.hasMany(OrderModel, {
        foreignKey: 'organizationId',
        constraints: false,
    });
    OrderModel.belongsTo(OrganizationModel, {
        foreignKey: 'organizationId',
        constraints: false,
    });

    await sequelize.sync();

    if (process.env.NODE_ENV !== 'test') {
        logger.info(`Connected to MySQL via Sequelize at host ${host}`);
    }
}

async function teardown(): Promise<void> {
    if (!sequelize) return;
    await sequelize.close();
    sequelize = undefined;
}

const impl: Persistence = {
    init,
    teardown,
};

export = impl;
