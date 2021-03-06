<template>
	<!-- Pregunta si la publicacion no es null, solucionando el problema de renderizado -->
	<div v-if="publicacion !== null">

		<!-- Contenido a mostrar si la subasta no cerro -->
		<div style="max-width: 800px; margin: auto;">

			<br>

			<v-card>
				<!-- Cabecera de la v-card -->
				<v-toolbar
					color="primary"
					height="45px"
				>
					<v-layout justify-center>
						<v-toolbar-title class="font-weight-black display-1">
							<span class="white--text">
								Residencia en subasta:
							</span>
						</v-toolbar-title>
					</v-layout>
				</v-toolbar>

				<span class="headline font-weight-medium">
					<!-- Imagenes/fotos acerca de la residencia -->
					<v-carousel
						style="height: 200px"
						v-if="residencia.fotos.length > 0"
					>
						<v-carousel-item
							v-for="(foto,i) in fotos"
							:key="i"
							style="background-color: #111111; max-height=100vh"
						>
							<v-layout row justify-center>
								<img
									:src="foto"
									style="height: 200px"
								>
							</v-layout>
						</v-carousel-item>
					</v-carousel>

					<!-- Caso de que la residencia referencia no tenga fotos -->
					<v-carousel
						style="height: 200px"
						v-else
					>
						<v-carousel-item
							v-for="(number,i) in 1"
							:key="i"
							style="background-color: #111111; max-height=100vh"
						>
							<v-layout row justify-center>
								<img
									style="height: 200px"
									src="@/assets/images/residenciaSinFoto.jpg"
								>
							</v-layout>
						</v-carousel-item>
					</v-carousel>

					<br>

					<!-- Nombre/titulo de la residencia -->
					<h1 class="font-weight-bold headline sombra-texto text-xs-center" style="padding-left: 20px">
						{{ obtenerResidenciaConId(publicacion.idResidencia).titulo }}
					</h1>
					<v-flex text-xs-right>
						<v-btn
							color="primary"
							:to="generarRutaDeResidencia( publicacion.idResidencia )"
							outline
						>
							Más información
						</v-btn>
					</v-flex>
				</span>

				<v-spacer></v-spacer>
				<br>
				<v-divider></v-divider>
				<br>

				<!-- Contenido de la v-card -->
				<h1 class="font-weight-bold headline sombra-texto text-xs-center" style="padding-left: 20px">
					Monto inicial de subasta: ${{ publicacion.montoInicialDeSubasta }}
				</h1>

				<br>

				<h1 class="font-weight-regular headline sombra-texto" style="padding-left: 20px">
					Precio minimo de oferta: ${{ this.mayorMontoOfertado }}
					<br>
					<span v-if="hayOfertaDeCliente">
						Tu oferta: ${{ this.obtenerOfertaDelPerfil }}
					</span>
					<br>


					<v-flex text-xs-right>
						<!-- Boton para cancelar la oferta si es que el cliente posee ofertas en la subasta -->
						<v-btn
							text-xs-right v-if="hayOfertaDeCliente"
							outline
							large
							@click.stop="cancelarOferta( publicacion._id )"
						>
							Cancelar oferta
						</v-btn>

						<!-- Boton para ofertar en la subasta en cuestion -->
						<v-btn
							color="#ed9702"
							large
							@click.stop="mostrarFormularioParaOfertar( )"
						>
							Ofertar
						</v-btn>
					</v-flex>

				</h1>

				<v-spacer></v-spacer>
				<br>

				<v-divider></v-divider>
				<br>

				<!-- Tabla que contiene el historial de las ofertas -->
				<h1 class="font-weight-bold headline sombra-texto" style="padding-left: 20px">
					Historial:
				</h1>

				<v-data-table
					:headers="encabezadosDeTabla"
					:items="this.obtenerOfertasDeLaSubasta"
					class="elevation-1 font-weight-black"
					no-data-text="No hay ofertas."
				>
					<template v-slot:items="props">
							<td class="text-xs-center font-weight-black"> {{ props.item.monto }} </td>
							<td class="text-xs-center font-weight-black"> {{ formatearFecha(props.item.fechaDeCreacion) }} </td>
					</template>
				</v-data-table>

				<br>
			</v-card>

		</div>

		<!-- Formulario de oferta -->
		<v-dialog persistent v-model="formularioDeOferta" max-width="40rem" v-if="perfilValido">
			<Ofertar
				@ofertaCreada="ocultarFormularioParaOfertar( )"
				@cancelacion="ocultarFormularioParaOfertar( )"
				:idCliente="this.$store.getters.perfil._id"
				:idPublicacion="this.idPublicacion"
			/>
		</v-dialog>
	</div>
</template>


<script lang="ts">
	import { Component, Vue, Prop } from 'vue-property-decorator';
	import VueRouter, { Route } from 'vue-router';
	import moment from 'moment';
	import { Residencia } from '@/interfaces/residencia.interface';
	import Ofertar from '@/components/Ofertar.vue';
	import { Oferta } from '@/interfaces/oferta.interface';
	import { VuetifyDataTableHeader } from '@/typings/vuetify-data-table-header.d';

	@Component({
		components: {
			Ofertar,
		},
	})
	export default class Publicacion extends Vue {

		@Prop({ default: undefined })
		public idPublicacion!: string;

		public formularioDeOferta: boolean = false;

		public encabezadosDeTabla: VuetifyDataTableHeader[ ] = [
			{
				text: 'Monto de oferta',
				value: 'monto',
				align: 'center'
			},
			{
				text: 'Día que se oferto',
				value: 'fechaDeCreacion',
				align: 'center'
			},
		];

		public mostrarFormularioParaOfertar( ): void {
			if (this.perfilValido) {
				if (this.$store.getters.perfil.creditos.length > 0) {
					this.formularioDeOferta = true;
				} else {
					this.$store.dispatch( 'mostrarAlerta', {
						tipo: 'error',
						texto: 'No posee créditos suficientes para poder realizar la operacion'
					});
				}
			} else {
				this.$store.dispatch( 'mostrarAlerta', {
					tipo: 'error',
					texto: 'Debe iniciar sesión para poder particiar en una subasta'
				});
			}
		}

		public ocultarFormularioParaOfertar( ): void {
			this.formularioDeOferta = false;
		}

		public get publicacion( ) {
			return this.$store.getters.publicacionConId(this.idPublicacion);
		}

		public get residencia( ): Residencia | undefined {
			return this.obtenerResidenciaConId(this.publicacion.idResidencia);
		}

		public get perfilValido( ): boolean {
			return (this.$store.getters.perfil !== undefined && this.$store.getters.perfil !== null );
		}

		public get fotos( ) {
			if (this.residencia !== undefined) {
				return this.residencia.fotos;
			}
		}

		public created( ) {
			this.$store.dispatch( 'obtenerResidencias' );
			this.$store.dispatch( 'obtenerPublicaciones' );
			this.$store.dispatch( 'obtenerAdquisiciones' );
			this.$store.dispatch( 'obtenerOfertas' );
		}

		public obtenerResidenciaConId( idResidencia: String ): Residencia | undefined {
			return this.$store.getters.residenciaConId( idResidencia );
		}

		public generarRutaDeResidencia( idResidencia: string ): object {
			return {
				name: 'residencia con id',
				params: {
					idResidencia
				}
			};
		}

		public formatearFecha(fecha: string): string {
			return moment(fecha).format('DD/MM/YYYY');
		}

		// Devuelve las ofertas de la subasta que se esta visualizando
		public get obtenerOfertasDeLaSubasta( ): Oferta[ ] {
			const ofertas: Oferta[ ] = this.$store.getters.ofertas;
			const ofertasDeSubasta = ofertas.filter( (oferta) => {
				return oferta.idPublicacion === this.idPublicacion;
			});
			return ofertasDeSubasta;
		}

		// Devuelve el mayor monto ofertado en la subasta, en el caso ...
		// ... de que no haya ofertas devuelve el monto inicial de subasta
		public get mayorMontoOfertado( ): number {
			if (this.obtenerOfertasDeLaSubasta.length > 0) {
				const maximo = this.obtenerOfertasDeLaSubasta.sort( ( a, b ) => {
					if ( a.monto > b.monto ) {
						return -1;
					}
					else if ( a.monto < b.monto ) {
						return +1;
					}
					else {
						return 0;
					}
				});

				return maximo[0].monto;
			} else {
				return	this.$store.getters.publicacionConId( this.idPublicacion ).montoInicialDeSubasta;
			}
		}

		// Se fija si el perfil (o cliente ingresado en el sistema) ...
		// ... tiene ofertas en la subasta que se esta visualizando
		public get hayOfertaDeCliente( ): boolean {
			if (this.perfilValido) {
				const ofertaDelCliente = this.obtenerOfertasDeLaSubasta.filter( (oferta) => {
					return oferta.idCliente === this.$store.getters.perfil._id;
				});

				if (ofertaDelCliente.length > 0) {
					return true;
				} else {
					return false;
				}
			} else {
				return false;
			}
		}

		// Elimina la oferta que tiene el perfil (o cliente ingresado en el sistema) en subasta que se esta visualizando
		public async cancelarOferta( idPublicacion: string ) {
			const ofertasDeLaSubasta: Oferta[ ] = this.obtenerOfertasDeLaSubasta;

			const ofertaDeCliente = ofertasDeLaSubasta.filter( ( oferta ) => {
				const igualPublicacion = oferta.idPublicacion === idPublicacion;
				const igualPerfil = oferta.idCliente === this.$store.getters.perfil._id;

				return igualPublicacion && igualPerfil;
			});

			await this.$store.dispatch( 'eliminarOferta', ofertaDeCliente[0]._id );

			await this.$store.dispatch( 'mostrarAlerta', {
				tipo: 'success',
				texto: 'Se retiro la oferta de la subasta'
			});
		}

		// Obtiene el monto de la oferta del perfil (o cliente ingresado en el sistema) de la subasta que se esta visualizando
		public get obtenerOfertaDelPerfil( ): number {
			const ofertasDeLaSubasta: Oferta[ ] = this.obtenerOfertasDeLaSubasta;

			const ofertaDeCliente = ofertasDeLaSubasta.filter( ( oferta ) => {
				const igualPublicacion = oferta.idPublicacion === this.idPublicacion;
				const igualPerfil = oferta.idCliente === this.$store.getters.perfil._id;

				return igualPublicacion && igualPerfil;
			});

			return ofertaDeCliente[0].monto;
		}
	}
</script>