
import 'reflect-metadata';
import { InvoicesResolver } from './resolver/invoices';
import { config } from 'dotenv';
config();
import {buildSchema} from 'type-graphql';
import expressPlayground from 'graphql-playground-middleware-express';
import express from 'express';
import cors from 'cors';
import cookieParser = require('cookie-parser');
import { ApolloServer,gql } from 'apollo-server-express';
import { prisma, UserResolver } from './resolver/user';
import { GraphQLUpload, graphqlUploadExpress} from 'graphql-upload';
import { finished } from 'stream/promises';
import serviceRoutine from './serviceRoutine/index';
import { StaffResolver } from './resolver/staff';
import routes from './router';
import nodemailer from 'nodemailer';
import { AccountMetaTraderResolver } from './resolver/accountMetaTrader';
import { PlanInvoicesResolver } from './resolver/planInvoices';
import { OrdersResolver } from './resolver/orders';
import { LoteAutoCalculateResolver } from './resolver/loteAutoCalculate';
import { OrdersAccountResolver } from './resolver/ordersAccount';
import { DocumentPictureResolver } from './resolver/upload';
import { LiedResolver } from './resolver/lied';
const v1 = express.Router();

/* -------------------------------------------------------------------------- */
/*         NOTE ativar novamente         */
/* -------------------------------------------------------------------------- */

//serviceRoutine();
/*
const transporter = nodemailer.createTransport({
	service: 'Gmail',
	auth: {
		user: process.env.GMAIL_USER,
		pass: process.env.GMAIL_PASS,
	},
});
*/
(async () => {

	const corsOptions = {
		origin: [
			'https://api.spiritgoldforex.com/',
			(process.env.FRONT_IP as string ),
			'http://185.227.110.67:7000',
			'https://api.spiritgoldforex.com',
			'https://www.spiritgoldforex.com/',
			'https://www.spiritgoldforex.com',
			'http://192.168.1.66:3000',
			'http://192.168.1.66:3000/',
			'http://localhost:3000',
			'http://localhost:3000/',
			'http://localhost:4000/',
			'http://localhost:4000/graphql/',
			'http://192.168.1.223:3000',
			'http://192.168.1.223:3000/',
			'http://192.168.1.223:3000/graphql/',
		],
		credentials: true,
		optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
	};

	const schema = await buildSchema({
		resolvers: [
			StaffResolver,
			UserResolver,
			AccountMetaTraderResolver,
			InvoicesResolver,
			PlanInvoicesResolver,
			OrdersResolver,
			LoteAutoCalculateResolver,
			OrdersAccountResolver,
			DocumentPictureResolver,
			LiedResolver
		], 
	});

	const server = new ApolloServer({
		schema,
		context: async ({ req, res }: any) => {
			
			return({ req, res });},
	});
	await server.start();
	const app = express();
	app.use(cors(corsOptions));
	app.use(cookieParser());
	app.use(routes);
	app.use(graphqlUploadExpress());
	server.applyMiddleware({ app, cors:corsOptions });
	app.use('/graphql', function (req, res, next) {

		next();
	});

	
	app.get('/playground', expressPlayground({ endpoint: '/graphql' }));
	
	app.use('/graphql', async function (req, res, next) {
	
		await prisma.log.create({
			data:{
				action:	String(	'req =>'+ req +	' res =>' + res	)
				
			}
		});
		next();
	});

	app.listen(process.env.DOOR, () => {
		console.log(`
		🚀  Server is running!
		🔉  Listening on port ${process.env.DOOR}
	`);
	});
})();
