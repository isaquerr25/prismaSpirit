import { Console } from 'console';
import { MiddlewareFn } from 'type-graphql';
import { prisma } from '../resolver/user';

import { MyContext } from '../types/MyContext';
import { getTokenId } from '../utils';

export const isUserAuth: MiddlewareFn<MyContext> = async ({ context }, next) => {
	
	try{

		await prisma.log.create({
			data:{
				action:	String('body => ' + JSON.stringify(context.req.body) +  ' cookie => ' + String(context.req.headers.cookie ?? '') + ' getTokenId => ' + JSON.stringify((getTokenId(context).Enum)) )	
			
			}
		});

	}catch(error){
		console.log('error isUserAuth =>',error);
	}
	if (!getTokenId(context).Enum) {
		throw new Error('not user authenticated');
	}

	return next();
};
