import { MiddlewareFn } from 'type-graphql';
import { prisma } from '../resolver/user';
import { MyContext } from '../types/MyContext';
import { getTokenId } from '../utils';

export const isManagerAuth: MiddlewareFn<MyContext> = async ({ context }, next) => {
	const businessEnum = ['ADMIN','MANAGER','DEVELOPER','TESTER'];

	try{

		await prisma.log.create({
			data:{
				action:	String('body => ' + JSON.stringify(context.req.body) +  ' cookie => ' + String(context.req.headers.cookie ?? '') + ' getTokenId => ' + JSON.stringify((getTokenId(context).Enum))   )	
			
			}
		});
		
	}catch(error){
		console.log('error isUserAuth =>',error);
	}

	if (getTokenId(context)?.Enum) {
		if (businessEnum.includes(getTokenId(context).Enum) ) {
			return next();
		}
	}

	throw new Error('not user authenticated');
};
