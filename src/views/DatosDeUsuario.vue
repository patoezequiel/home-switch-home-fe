<template>
	<v-container
		grid-list-{xs through xl}
		v-if="perfil !== null"
	>
		<v-layout row wrap>
			<v-flex>
				<v-card
				v-if="perfil !== null"
				width="500"
				class="ma-1"
				>
					<v-layout column align-center ma-1>
						<v-flex subheading  font-weight-black mt-2 ml-1>
							Info de Cuenta
						</v-flex>
					</v-layout>
					<hr class="ma-1">
					<v-layout column ml-2>
						<v-flex subheading  font-weight-black ml-1>
							Info personal y de contacto
						</v-flex>
						<v-layout row>
							<v-layout column class="body-1 font-weight-medium" ml-2 mt-1>
								<v-flex ma-1>
									Nombre completo:
								</v-flex>
								<v-flex ma-1>
									Fecha de nacimiento:
								</v-flex>
								<v-flex ma-1>
									País:
								</v-flex>
								<v-flex ma-1>
									Calular:
								</v-flex>
								<v-flex ma-1>
									Email:
								</v-flex>
							</v-layout>
							<v-layout column class="body-1" mr-2 mt-1 align-end>
								<v-flex ma-1>
									{{	perfil.nombre }} {{ perfil.apellido }}
								</v-flex>
								<v-flex ma-1>
									{{ formatearFecha( perfil.fechaDeNacimiento ) }}
								</v-flex>
								<v-flex ma-1>
									{{ perfil.pais }}
								</v-flex>
								<v-flex ma-1>
									{{ perfil.celular }}
								</v-flex>
								<v-flex ma-1>
									{{ perfil.email }}
								</v-flex>
							</v-layout>
						</v-layout>
						<v-layout column align-end>
							<v-flex ma-1>
								<v-btn
									color="primary"
									@click.stop="mostrarFormularioDeModificacion()"
								>
								Modificar
								</v-btn>
							</v-flex>
						</v-layout>

						<hr class="ma-3">


						<!-- Información acerca la tarjeta del cliente -->
						<v-flex subheading  font-weight-black ml-1>
							Tarjeta de crédito
						</v-flex>
						<v-layout row>
							<v-layout column class="body-1 font-weight-medium" ml-2 mt-1>
								<v-flex ma-1>
									Nro. de tarjeta de Crédito:
								</v-flex>
								<v-flex ma-1>
									Fecha de expiracion:
								</v-flex>
							</v-layout>
							<v-layout column class="body-1" mr-2 mt-1 align-end>
								<v-flex ma-1>
									**** - **** - **** - {{perfil.tarjetaDeCredito.substr(-4)}}
								</v-flex>
								<v-flex ma-1>
									{{ formatearFechaTarjeta( perfil.fechaDeExpiracion )}}
								</v-flex>
							</v-layout>
						</v-layout>
						<v-layout column align-end>
							<v-flex ma-1>
								<v-btn
									color="primary"
									@click.stop="mostrarFormularioDeModificacionTarjeta()"
								>
								Modificar
								</v-btn>
							</v-flex>
						</v-layout>


						<hr class="ma-3">

						<!-- Información acerca los créditos del cliente -->
						<v-flex subheading  font-weight-black ml-1>
							Créditos:
						</v-flex>

						<v-layout row>
							<v-layout column class="body-1 font-weight-medium" ml-2 mt-1>
								<v-flex ma-1>
							En total hay {{ creditosVigentes }} créditos vigentes.
								</v-flex>
							</v-layout>
						</v-layout>

						<!-- Botón para comprar más créditos -->
						<v-layout column align-end>
							<v-flex ma-1>
								<v-btn
									color="primary"
									@click.stop="mostrarFormularioDeComprarCreditos()"
								>
								Comprar créditos
								</v-btn>
							</v-flex>
						</v-layout>
						<br>

					</v-layout>
				</v-card>
			</v-flex>
			<v-layout column v-if="suscripcion && perfil">
				<v-flex>
					<v-card
					class="ma-1"
					width="200"
					>
						<v-layout column align-center>
							<v-flex align-center mt-5 class="body-1 font-weight-medium">
								Tipo de cuenta
							</v-flex>

							<v-flex align-center mt-1 class="title font-weight-black">
								<span v-if="suscripcion.tipoDeSuscripcion === 'Premium'" color="#FFC21E">
									{{suscripcion.tipoDeSuscripcion}}
								</span>
								<span v-if="suscripcion.tipoDeSuscripcion === 'Regular'">
									{{suscripcion.tipoDeSuscripcion}}
								</span>
							</v-flex>

							<v-flex mt-1 mb-4>
								<v-btn
									v-if="solicitudPorId(perfil._id) === null && suscripcion.tipoDeSuscripcion !== 'Premium'"
									color="#FFC21E"
									@click.stop=" procesarSolicitud( perfil._id )"
								>
									Solicitar promoción
								</v-btn>
								<v-btn
									v-if="(solicitudPorId(perfil._id) === null) && suscripcion.tipoDeSuscripcion !== 'Regular'"
									color="red"
									@click.stop="procesarSolicitud( perfil._id )"
								>
									Baja de premium
								</v-btn>
								<v-btn
									v-if="(solicitudPorId(perfil._id) !== null)"
									color="green"
									disabled
								>
									Espere confirmación
								</v-btn>
							</v-flex>
							<v-flex class="body-1 font-weight-medium">
								Actualmente esta pagando:
							</v-flex>
							<v-flex align-center mt-1 class="title font-weight-black">
								$ {{suscripcion.monto}}
							</v-flex>
							<br>
						</v-layout>
					</v-card>
				</v-flex>
			</v-layout>
				<v-layout column>
					<div class="display-1 ma-5">Tus semanas adquiridas</div>
					<div>
						<TablaDeSemanasDeCliente
							:idCliente="perfil._id"
						/>
					</div>
				</v-layout>
		</v-layout>

		<v-dialog persistent v-model="formularioDeModificacionEsVisible" max-width="40rem">
			<ModificacionDeDatosDeCliente
				:cliente="perfil"
				@infoModificada="modificarInfo( $event )"
				@error="emitirEventoError( $event )"
				@cancelacion="ocultarFormularioDeModificacion( )"
			/>
		</v-dialog>

		<v-dialog persistent v-model="formularioDeModificacionTarjetaEsVisible" max-width="40rem">
			<ModificarDeTarjetaDeCreditoDeCliente
				:cliente="perfil"
				@infoModificada="modificarInfo( $event )"
				@error="emitirEventoError( $event )"
				@cancelacion="ocultarFormularioDeModificacionTarjeta( )"
			/>
		</v-dialog>

		<v-dialog persistent v-model="formularioDeCompraDeCreditos" max-width="40rem">
			<CompraDeCreditos
				:cliente="perfil"
				@infoModificada="modificarInfo( $event )"
				@error="emitirEventoError( $event )"
				@cancelacion="ocultarFormularioDeComprarCreditos( )"
			/>
		</v-dialog>

	</v-container>
</template>

<script lang="ts">
import { Component, Vue , Emit } from 'vue-property-decorator';
import ModificacionDeDatosDeCliente from '@/components/ModificacionDeDatosDeCliente.vue';
import ModificarDeTarjetaDeCreditoDeCliente from '@/components/ModificarDeTarjetaDeCreditoDeCliente.vue';
import CompraDeCreditos from '@/components/CompraDeCreditos.vue';
import { Cliente } from '../interfaces/cliente.interface';
import { Credito } from '../interfaces/credito.interface';
import moment from 'moment';
import { Suscripcion } from '../interfaces/suscripcion.interface';
import { SolicitudParaCrear, Solicitud } from '@/interfaces/solicitud.interface';
import TablaDeSemanasDeCliente from '@/components/TablaDeSemanasDeCliente.vue';

@Component({
	components: {
		ModificacionDeDatosDeCliente,
		ModificarDeTarjetaDeCreditoDeCliente,
		CompraDeCreditos,
		TablaDeSemanasDeCliente
	}
})
export default class DatosDeUsuario extends Vue {

	// getters

	public get perfil( ): Cliente | null {
		const perfil = this.$store.getters.perfil;
		return ( perfil === null )
			? null
			: perfil;
	}

	public get suscripcion( ): Suscripcion | null {
		if ( this.perfil === null ) {
			return null;
		}
		return this.$store.getters.suscripcionConId( this.perfil.idSuscripcion );
	}

	public get obtenerSolicitudes(): Solicitud[ ] {
		return this.$store.getters.solicitudes;
	}

	// logica de créditos vigentes para mostrar

	public get creditosVigentes(): number {
		const creditos: Credito[ ] = this.$store.getters.perfil.creditos;
		const cantidadDeCreditosVigentes: number = creditos.filter( (_credito) => {
			const expiracion: boolean = moment( moment(_credito.fechaDeCreacion).add(1, 'years') ).isAfter( moment() );
			return _credito.activo && expiracion;
		}).length;
		return cantidadDeCreditosVigentes;
	}

	// ocultación y muestra de formularios
	/* Muestra formulario de modificación de datos de usuario*/
	/* variables que ayudan a que se muestre o no ventanas dialog de modificación */
	public formularioDeModificacionEsVisible = false;
	public formularioDeModificacionTarjetaEsVisible = false;
	public formularioDeCompraDeCreditos = false;

	public created( ) {
		this.$store.dispatch('obtenerSolicitudes');
		this.$store.dispatch('obtenerSuscripciones');
	}

	public mostrarFormularioDeModificacion( ): void {
		this.formularioDeModificacionEsVisible = true;
	}

	public mostrarFormularioDeModificacionTarjeta( ): void {
		this.formularioDeModificacionTarjetaEsVisible = true;
	}

	public mostrarFormularioDeComprarCreditos( ): void {
		this.formularioDeCompraDeCreditos = true;
	}

	public ocultarFormularioDeComprarCreditos( ): void {
			this.formularioDeCompraDeCreditos = false;
	}

	public ocultarFormularioDeModificacion( ): void {
			this.formularioDeModificacionEsVisible = false;
	}

	public ocultarFormularioDeModificacionTarjeta( ): void {
			this.formularioDeModificacionTarjetaEsVisible = false;
	}

	/* Eventos
	 * Emitidos por ModificacionDeDatosDeUsuario
	 * El siguiente es emitido al modificar info de usuario
	 */
	@Emit( 'infoModificada' )
	public emitirEventoInfoModificada( ): void { }

	/* El siguiente es emitido al tener algun tipo de error, luego se muestra */
	@Emit( 'error' )
	public emitirEventoError( error: Error ): Error {
		return error;
	}

	// metodo que modifica info de Usuario

	public modificarInfo( usuario: Cliente ): void {
		this.emitirEventoInfoModificada( );
		this.ocultarFormularioDeModificacion( );
		this.ocultarFormularioDeModificacionTarjeta( );
		this.ocultarFormularioDeComprarCreditos( );
	}

	public suscripcionPorId(id: String): Suscripcion {
		return this.$store.getters.suscripcionConId(id);
	}

	public solicitudPorId(idCliente: String): Solicitud | null {
		return this.$store.getters.solicitudConId(idCliente);
	}

	// modificar fecha para mostrarla

	public formatearFecha(fecha: string): string {
		return moment(fecha).format('DD/MM/YYYY');
	}
	public formatearFechaTarjeta(fecha: string): string {
			return moment(fecha).lang('es').format('MMMM [de] YYYY');
	}
	// logica de peticiones para solicitudes de promoción o degradación

	public async procesarSolicitud( _idCliente: string) {
		const solicitudParaCrear: SolicitudParaCrear = {
			idCliente: _idCliente,
		};
		await this.$store.dispatch( 'crearSolicitud', solicitudParaCrear );
	}
}
</script>