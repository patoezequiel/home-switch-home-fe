import { RemoverPropiedades } from '@/typings/remover-propiedades';

export interface Oferta {
	idOferta: string;
	email: string;
	tarjeta: string;
	monto: number;
}

export type SubastaParaCrear = RemoverPropiedades<Oferta, 'idOferta'>;
export type SubastaParaModificar = RemoverPropiedades<Oferta, 'idOferta' >;