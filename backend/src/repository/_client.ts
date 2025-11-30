import {
    Sequelize,
    DataTypes,
    Model,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from 'sequelize';
import fs from 'fs';
import waitPort from 'wait-port';

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

export class OrganizationModel extends Model<
    InferAttributes<OrganizationModel>,
    InferCreationAttributes<OrganizationModel>
> {
    declare id: CreationOptional<string>;
    declare name: string;
    declare industry: string | null;
    declare dateFounded: Date | null;
}

export class UserModel extends Model<
    InferAttributes<UserModel>,
    InferCreationAttributes<UserModel>
> {
    declare id: CreationOptional<string>;
    declare firstName: string;
    declare lastName: string;
    declare email: string;
    declare dateCreated: CreationOptional<Date | null>;
    declare organizationId: string;
}

export class OrderModel extends Model<
    InferAttributes<OrderModel>,
    InferCreationAttributes<OrderModel>
> {
    declare id: CreationOptional<string>;
    declare orderDate: Date | null;
    declare totalAmount: number;
    declare userId: string;
    declare organizationId: string;
}

let initialized = false;

async function ensureSequelize(): Promise<Sequelize> {
    if (sequelize) return sequelize;

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

    await waitPort({
        host,
        port: 3306,
        timeout: 30000,
        waitForDns: true,
    } as any);

    sequelize = new Sequelize(
        database as string,
        user as string,
        (password as string) || undefined,
        {
            host,
            dialect: 'mysql',
            logging: false,
        },
    );

    return sequelize;
}

export async function getModels() {
    const seq = await ensureSequelize();

    if (!initialized) {
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
            { tableName: 'organizations', timestamps: false, sequelize: seq },
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
            { tableName: 'users', timestamps: false, sequelize: seq },
        );

        OrderModel.init(
            {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    primaryKey: true,
                },
                orderDate: { type: DataTypes.DATE, allowNull: false },
                totalAmount: {
                    type: DataTypes.DECIMAL(10, 2),
                    allowNull: false,
                },
                userId: { type: DataTypes.UUID, allowNull: false },
                organizationId: { type: DataTypes.UUID, allowNull: false },
            },
            { tableName: 'orders', timestamps: false, sequelize: seq },
        );

        OrganizationModel.hasMany(UserModel, {
            foreignKey: 'organizationId',
            constraints: false,
        });
        UserModel.belongsTo(OrganizationModel, {
            foreignKey: 'organizationId',
            constraints: false,
        });
        UserModel.hasMany(OrderModel, {
            foreignKey: 'userId',
            constraints: false,
        });
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

        initialized = true;
    }

    return { sequelize: seq, OrganizationModel, UserModel, OrderModel };
}
