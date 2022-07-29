import _ from 'lodash';
import nodemailer from 'nodemailer';
import { createAuthToken, createWithdrawToken } from '../utils';
import { UserAll } from '../dto/user';
import sgMail from '@sendgrid/mail';

const  emailValidSend = async(user:any) =>{

	const token = createAuthToken(user.id,user.Enum);
	const url = `${process.env.FRONT_IP!}/home/register/accountValid/sss?token=${token}`;
	sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
	const msg = {
		to: user.email, // Change to your recipient
		from: process.env.SENDGRID_API_EMAIL!, // Change to your verified sender
		subject: 'Confirm Email',
		text: 'Confirm',
		html: `Please click this link to confirm your email: <a href="${url}">${url}</a>`,
	};
	sgMail
		.send(msg)
		.then((result) => console.log('result ',result))
		.catch((error) => {
			console.error(error);
		});
};

export const  emailForgetPasswordSend = async(user:any) =>{

	const token = createAuthToken(user.id,user.Enum);
	const url = `${process.env.FRONT_IP!}/home/login/newPassword/sss?token=${token}`;
	sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

	const msg = {
		to: user.email, // Change to your recipient
		from: process.env.SENDGRID_API_EMAIL!, // Change to your verified sender
		subject: 'Confirm Email',
		text: 'Confirm',
		html: `Please click this link to alter your password: <a href="${url}">${url}</a>`,
	};
	return sgMail
		.send(msg)
		.then((result) => {console.log('result ',result);return('success');})
		.catch((error) => {console.log('result ',error);return(error);});
	
};


interface typeEmailRandom{
	
	to:string
	from:string
	subject:string
	text:string
	html:string
}

export const  emailRandom = async(emailRandom:typeEmailRandom) =>{

	console.log(process.env.SENDGRID_API_KEY!);
	sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

	const msg = {
		to: emailRandom.to, // Change to your recipient
		from: emailRandom.from, // Change to your verified sender
		subject:  emailRandom.subject,
		text:  emailRandom.text,
		html:  emailRandom.html,
	};
	return await sgMail
		.send(msg)
		.then((result) => {console.log('result ',result);return('success');})
		.catch((error) => {console.log('result ',error);return(error);});
	
};

export default emailValidSend;
