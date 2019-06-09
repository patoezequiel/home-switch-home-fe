import { RemoverPropiedades } from '@/typings/remover-propiedades';

export interface Cliente {
	_id: string;
	idSuscripcion: string;
	nombre: string;
	apellido: string;
	email: string;
	contraseña: string;
	fechaDeNacimiento: string;
	celular: string;
	ciudad: string;
	tarjetaDeCredito: string;

	// Va a tener un arreglo de objetos {fechaDeCreacion: string, valido: boollean} ¿es un arreglo de strings?
	creditos: string[ ];
}

export type ClienteParaCrear = RemoverPropiedades<Cliente, '_id' >;