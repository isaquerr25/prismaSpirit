import { ObjectType, Field, InputType, Int} from 'type-graphql';
import { UserAll } from './user';
import { GraphQLUpload, Upload, FileUpload } from 'graphql-upload';
import { Stream } from 'stream';

@ObjectType()
export class DocumentAll {
	@Field(() => Int)
		id?: number;
	@Field(() => String)
		state?: string;
	@Field(() => String)
		fileName?: string;
	@Field(() => Int)
		userId?: number;
	@Field(() => Date)
		createdAt?: Date;
	@Field(() => Date)
		updatedAt?: Date;
}



@ObjectType()
export class DocumentAllUser {
	@Field(() => Int)
		id?: number;
	@Field(() => String)
		state?: string;
	@Field(() => String)
		fileName?: string;
	@Field(() => Int)
		userId?: number;
	@Field(() => Date)
		createdAt?: Date;
	@Field(() => Date)
		updatedAt?: Date;
	@Field(() => UserAll)
		user?: UserAll;
}



@InputType()
export class InputDocumentAlter {
	@Field(() => Int)
		id!: number;
	@Field(() => GraphQLUpload)
		UploadGraph!: typeof GraphQLUpload;
}

