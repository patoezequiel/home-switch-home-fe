<template>
	<v-card class="pa-3">

		<v-card-title>
			<h5 class="headline">Modificar residencia</h5>
		</v-card-title>

		<v-card-text>
			<v-form v-model="formularioEsValido" ref="formulario">
				<v-text-field
					v-model="modelo.titulo"
					label="Título"
					:rules="validadores.titulo"
					required
				></v-text-field>

				<v-text-field
					v-model="modelo.pais"
					label="País"
					:rules="validadores.pais"
					required
				></v-text-field>

				<v-text-field
					v-model="modelo.provincia"
					label="Provincia"
					:rules="validadores.provincia"
					required
				></v-text-field>

				<v-text-field
					v-model="modelo.localidad"
					label="Localidad"
					:rules="validadores.localidad"
					required
				></v-text-field>

				<v-text-field
					v-model="modelo.domicilio"
					label="Domicilio"
					:rules="validadores.domicilio"
					required
				></v-text-field>

				<v-textarea
					v-model="modelo.descripcion"
					label="Descripción"
					:rules="validadores.descripcion"
					no-resize
					required
				></v-textarea>

				<v-textarea
					:value="combinarLineas( modelo.fotos )"
					@input="modelo.fotos = extraerLineas( $event )"
					label="Fotos"
					:rules="validadores.fotos"
					hint="Introducí una URL de foto por renglón"
					no-resize
				></v-textarea>

				<v-text-field
					v-model="modelo.montoInicialDeSubasta"
					label="Monto inicial de subasta"
					:rules="validadores.montoInicialDeSubasta"
					hint="El monto no puede ser negativo"
					prefix="$"
					required
				></v-text-field>
			</v-form>
		</v-card-text>

		<v-card-actions>
			<v-spacer></v-spacer>
			<v-btn flat @click.stop="cancelarModificacion( )">
				Cancelar
			</v-btn>
			<v-btn
				class="success"
				:loading="esperandoModificacionDeResidencia"
				:disabled="!formularioEsValido"
				@click.stop="modificarResidencia( )"
			>
				Modificar
			</v-btn>
		</v-card-actions>
	</v-card>
</template>

<script lang="ts">
	import axios from 'axios';
	import { Component, Vue, Emit, Prop } from 'vue-property-decorator';
	import { requerido } from '@/helpers/validadores/requerido';
	import { textoNoVacio } from '@/helpers/validadores/texto-no-vacio';
	import { numeroNoNegativo } from '@/helpers/validadores/numero-no-negativo';
	import router from '@/router';
	import { VuetifyFormRef } from '@/typings/vuetify-form-ref.d';
	import { server } from '@/utils/helper';
	import { Residencia, ResidenciaParaModificar } from '../interfaces/residencia.interface';

	@Component
	export default class ModificacionDeResidencia extends Vue {
		public formulario: VuetifyFormRef | null = null;
		public formularioEsValido: boolean = false;

		/**
		 * Residencia para modificar
		 */
		@Prop( )
		public readonly residencia!: Residencia;

		/**
		 * Flag que se activa mientras se espera la respuesta a una solicitud de modificación de residencia
		 */
		public esperandoModificacionDeResidencia: boolean = false;

		/**
		 * Objeto que almacena el estado de la residencia para modificar de acuerdo al estado del formulario.
		 */
		public modelo: ResidenciaParaModificar = {
			titulo: this.residencia.titulo,
			pais: this.residencia.pais,
			provincia: this.residencia.provincia,
			localidad: this.residencia.localidad,
			domicilio: this.residencia.domicilio,
			descripcion: this.residencia.descripcion,
			fotos: this.residencia.fotos,
			montoInicialDeSubasta: this.residencia.montoInicialDeSubasta,
		};

		/**
		 * Conjunto de reglas de validación para cada campo del formulario de carga.
		 */
		public validadores = {
			titulo: [
				requerido( 'Título' ),
				textoNoVacio( 'Título' )
			],
			pais: [
				requerido( 'País' ),
				textoNoVacio( 'País' )
			],
			provincia: [
				requerido( 'Provincia' ),
				textoNoVacio( 'Provincia' )
			],
			localidad: [
				requerido( 'Localidad' ),
				textoNoVacio( 'Localidad' )
			],
			domicilio: [
				requerido( 'Domicilio' ),
				textoNoVacio( 'Domicilio' )
			],
			descripcion: [
				requerido( 'Descripción' ),
				textoNoVacio( 'Descripción' )
			],
			fotos: [ ],
			montoInicialDeSubasta: [
				requerido( 'Monto inicial de subasta' ),
				numeroNoNegativo( 'Monto inicial de subasta' )
			]
		};

		/**
		 * Hook de ciclo de vida. Restablece el formulario antes de que el componente se monte en el DOM.
		 */
		public beforeMount( ): void {
			this.restablecerFormulario( );
		}

		/**
		 * Hook de ciclo de vida. Guarda la referencia al formulario de modificación.
		 */
		public beforeUpdate( ): void {
			if ( this.formulario === null ) {
				this.formulario = this.$refs.formulario as unknown as VuetifyFormRef;
			}
		}

		/**
		 * Emite el evento _cancelacion_.
		 */
		@Emit( 'cancelacion' )
		public emitirEventoCancelacion( ): void { }

		/**
		 * Emite el evento _residenciaModificada_.
		 */
		@Emit( 'residenciaModificada' )
		public emitirEventoResidenciaModificada( ): void { }

		/**
		 * Restablece el formulario y emite el evento _cancelacion_.
		 */
		public cancelarModificacion( ): void {
			this.restablecerFormulario( );
			this.emitirEventoCancelacion( );
		}

		/**
		 * Solicita la modificación de una residencia de acuerdo al estado actual del modelo.
		 *
		 * Al recibir la respuesta de éxito restablece el formulario y emite el evento _residenciaModificada_.
		 */
		public async modificarResidencia( ): Promise<void> {
			this.esperandoModificacionDeResidencia = true;
			await this.$store.dispatch( 'modificarResidencia', {
				_id: this.residencia._id,
				residenciaParaModificar: this.modelo,
			});
			this.esperandoModificacionDeResidencia = false;

			this.restablecerFormulario( );
			this.emitirEventoResidenciaModificada( );
		}

		/**
		 * Restablece el formulario a su estado inicial.
		 */
		public restablecerFormulario( ): void {
			if ( this.formulario !== null ) {
				this.formulario.resetValidation( );
			}

			this.modelo.titulo                = this.residencia.titulo;
			this.modelo.pais                  = this.residencia.pais;
			this.modelo.provincia             = this.residencia.provincia;
			this.modelo.localidad             = this.residencia.localidad;
			this.modelo.domicilio             = this.residencia.domicilio;
			this.modelo.descripcion           = this.residencia.descripcion;
			this.modelo.fotos                 = this.residencia.fotos;
			this.modelo.montoInicialDeSubasta = this.residencia.montoInicialDeSubasta;

			this.formularioEsValido = false;
		}

		/**
		 * Dada una cadena de texto, retorna una lista de las lineas no vacias del texto
		 */
		public extraerLineas( texto: string ): string[ ] {
			return texto
				.split( /(?:\n|\r\n)+/ )
				.map( ( linea ) => linea.trim( ) )
				.filter( ( linea ) => linea !== '' );
		}

		/**
		 * Dada una lista de lineas, retorna un texto recombinándolas
		 */
		public combinarLineas( lineas: string[ ] ): string {
			return lineas
				.map( ( linea ) => linea.trim( ) )
				.filter( ( linea ) => linea !== '' )
				.join( '\n' );
		}
	}
</script>
