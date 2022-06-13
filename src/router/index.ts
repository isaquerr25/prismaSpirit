import fs from 'fs';
import stream from 'stream';
import express from 'express';
import path, { dirname } from 'path';
import {  decodeTokenType } from '../utils';
const routes = express.Router();
import cors from 'cors';
import { MyContext } from '../types/MyContext';
import { prisma } from '../resolver/user';
import axios from 'axios';
import { emailRandom } from '../systemEmail';
import bodyParser from 'body-parser';
const v1 = express.Router();


const jsonParser = bodyParser.json();

const urlencodedParser = bodyParser.urlencoded({ extended: false });

routes.use('/static', function(req,res, next) {
	res.header('Access-Control-Allow-Origin','*');
	// const context = {
	// 	req,
	// 	res
	// };
	// const businessEnum = ['ADMIN','MANAGER','DEVELOPER','TESTER'];

	// if (getTokenId(context)?.Enum) {
	// 	if (businessEnum.includes(getTokenId(context).Enum) ) {
	// 		next();
	// 	}else{
	// 		throw new Error('not user authenticated');
	// 	}
	// }else{
	// 	throw new Error('not user authenticated');
	// }
	next();

});

routes.use('/static', express.static(path.join(__dirname,'../../images/')));

routes.get('/confirmation_emial/:tokenID', async function(req, res) {
	res.header('Access-Control-Allow-Origin','*');
	

	const idPrimary = decodeTokenType(req.params.tokenID).userId;
	console.log(process.env.FRONT_IP!);
	console.log(idPrimary);
	if(idPrimary){
		try{
			await prisma.user.update({
				where: { id: idPrimary },
				data: { confirm: 'valid' },
			});
			
			return res.send('valid');
		}catch(error){
			console.log(error);
			res.status(404);
		}
	}
	res.status(404);
});


routes.get('/exchange', async function(req, res) {
	res.header('Access-Control-Allow-Origin','*');
	let result:any;
	try{

		await axios.get('https://api.bitapi.pro/v1/market/overview').then((res) => {
			console.log(res.data);
			result = res.data;
		});
		res.send(result);

	}catch(error){
		console.log(error);
		res.status(404);
	}
	
});

routes.use('/post_email', function(req,res, next) {
	res.set('Access-Control-Allow-Origin', '*');
	next();

});
routes.post('/post_email',jsonParser, async function (req, res) {

	res.set('Access-Control-Allow-Origin', '*');
	console.log(req.body);
	console.log(await req.body);
	console.log(await req.body);
	const emailRandomD = await req.body;
	const resume = await emailRandom(emailRandomD);
	console.log(resume);
	res.send(resume);
	

});


routes.all('/api/set_sinal',jsonParser, async function (req, res) {
	console.log('pato');
	console.log(req);
	console.log(req.body);
	console.log(await req.body);
	console.log(await req.body);
	return 'ducke';

});


export default routes;