<template>

	<div>
		<v-data-table
			class="elevation-1"
			:headers="encabezadosDeTabla"
			:items="residencias"
			no-data-text="No hay residencias cargadas en el sistema ¡Intentá crear algunas!"
		>
			<template #items="props">
				<td class="text-xs-right">{{ props.item._id }}</td>
				<td class="text-xs-right">{{ props.item.titulo }}</td>
				<td class="text-xs-right">{{ props.item.pais }}</td>
				<td class="text-xs-right">{{ props.item.provincia }}</td>
				<td class="text-xs-right">{{ props.item.localidad }}</td>
				<td class="text-xs-right">{{ props.item.domicilio }}</td>
				<td class="text-xs-right">
					{{ props.item.fotos.length }} {{ props.item.fotos.length === 1 ? 'foto' : 'fotos' }}
				</td>
				<td class="text-xs-right">
					$ {{ props.item.montoInicialDeSubasta }}
				</td>
				<td>
					<v-layout row>
						<v-tooltip left open-delay="100" close-delay="0">
							<template v-slot:activator="{ on }">
								<v-btn
									flat
									icon
									class="secondary--text"
									@click.stop="mostrarFormularioDeModificacion( props.item._id )"
									v-on="on"
								>
									<v-icon>edit</v-icon>
								</v-btn>
							</template>
							<span>Editar residencia</span>
						</v-tooltip>

						<v-tooltip left open-delay="100" close-delay="0">
							<template v-slot:activator="{ on }">
								<v-btn
									flat
									icon
									class="secondary--text"
									@click.stop="eliminarResidencia( props.item._id )"
									v-on="on"
								>
									<v-icon>delete</v-icon>
								</v-btn>
							</template>
							<span>Eliminar residencia</span>
						</v-tooltip>

						<v-tooltip left open-delay="100" close-delay="0">
							<template v-slot:activator="{ on }">
								<v-btn
									flat
									icon
									class="secondary--text"
									@click.stop="mostrarDetalle( props.item._id )"
								>
								<v-icon>info</v-icon>
								</v-btn>
							</template>
							<span>Detalles de Residencia</span>
						</v-tooltip>

						<v-tooltip left open-delay="100" close-delay="0">
							<template v-slot:activator="{ on }">
								<v-btn
									flat
									icon
									class="secondary--text"
									:to="generarRuta( props.item._id)"
								>
								<v-icon>home</v-icon>
								</v-btn>
							</template>
							<span>Informacion de Residencia Completa</span>
						</v-tooltip>
					</v-layout>
				</td>
			</template>
		</v-data-table>
		<v-dialog persistent v-model="detalleEsVisible" max-width="40rem">
			<DetalleDeResidencia
				v-if="residenciaParaMostrar !== null"
				:residencia="residenciaParaMostrar"
				@ok="ocultarDetalle( )"
			/>
		</v-dialog>
		<v-dialog persistent v-model="formularioDeModificacionEsVisible" max-width="40rem">
			<ModificacionDeResidencia
				v-if="residenciaParaModificar !== null"
				:residencia="residenciaParaModificar"
				@residenciaModificada="modificarResidencia( $event )"
				@error="emitirEventoError( $event )"
				@cancelacion="ocultarFormularioDeModificacion( )"
			/>
		</v-dialog>
	</div>

</template>


<script lang="ts">
	import axios from 'axios';
	import { Component, Vue, Emit, Prop } from 'vue-property-decorator';
	import { Residencia, ResidenciaParaModificar } from '@/interfaces/residencia.interface';
	import { VuetifyFormRef } from '@/typings/vuetify-form-ref.d';
	import { VuetifyDataTableHeader } from '@/typings/vuetify-data-table-header.d';
	import { server } from '@/utils/helper';
	import ModificacionDeResidencia from './ModificacionDeResidencia.vue';
	import DetalleDeResidencia from './DetalleDeResidencia.vue';
	import router from '@/router';

	@Component({
		components: {
			ModificacionDeResidencia,
			DetalleDeResidencia
		}
	})
	export default class TablaDeResidencias extends Vue {
		/**
		 * Lista de las residencias a mostrar en la tabla
		 */
		@Prop( )
		public readonly residencias!: Residencia[ ];
		/**
		 * Flag que indica si se debe o no mostrar el formulario de modificación.
		 */
		public formularioDeModificacionEsVisible: boolean = false;
		/**
		 * Flag que indica que el detalle de una residencia es visible
		 */
		public detalleEsVisible: boolean = false;
		/**
		 * Variable que almacena una residencia mientras está siendo modificada, es _null_ en cualquier otro caso.
		 */
		public residenciaParaModificar: Residencia | null = null;
		/**
		 * Variable que almacena una residencia a ser mostrada en detalle
		 */
		public residenciaParaMostrar: Residencia | null = null;
		/**
		 * Lista con los encabezados a mostrar en la tabla, indicado la etiqueta y el nombre del campo a mostrar
		 */
		public encabezadosDeTabla: VuetifyDataTableHeader[ ] = [
			{
				text: 'Id',
				value: '_id',
				align: 'right'
			},
			{
				text: 'Título',
				value: 'titulo',
				align: 'right'
			},
			{
				text: 'País',
				value: 'pais',
				align: 'right'
			},
			{
				text: 'Provincia',
				value: 'provincia',
				align: 'right'
			},
			{
				text: 'Localidad',
				value: 'localidad',
				align: 'right'
			},
			{
				text: 'Domicilio',
				value: 'domicilio',
				align: 'right'
			},
			{
				text: 'Fotos',
				value: 'fotos',
				align: 'right'
			},
			{
				text: 'Monto inicial de subasta',
				value: 'montoInicialDeSubasta',
				align: 'right'
			},
			{
				text: '',
				value: '',
				align: 'right',
				sortable: false
			},
		];

		/**
		 * Emite el evento _residenciaModificada_.
		 */
		@Emit( 'residenciaModificada' )
		public emitirEventoResidenciaModificada( ): void { }

		/**
		 * Emite el evento _residenciaEliminada_.
		 */
		@Emit( 'residenciaEliminada' )
		public emitirEventoResidenciaEliminada( ): void { }

		/**
		 * Emite el evento _error_ con el error recibido.
		 */
		@Emit( 'error' )
		public emitirEventoError( error: Error ): Error {
			return error;
		}

		/**
		 * Oculta el formulario de modificación de residencias y emite el evento _residenciaModificada_.
		 */
		public modificarResidencia( residencia: Residencia ): void {
			this.emitirEventoResidenciaModificada( );
			this.ocultarFormularioDeModificacion( );
		}

		/**
		 * Solicita la eliminación de la residencia con el ID recibido.
		 *
		 * Al recibir la respuesta de éxito emite el evento _residenciaModificada_.
		 *
		 * Falla en caso de que no exista residencia con el ID recibido.
		 */
		public async eliminarResidencia( idResidencia: string ): Promise<void> {
			await this.$store.dispatch( 'eliminarResidencia', idResidencia );
		}
		/**
		 * Mostrar detalle de residencia con un id dado
		 */
		public  mostrarDetalle( idResidencia: string ): void {
			const residencia: Residencia | null = this.$store.getters.residenciaConId( idResidencia );

			if ( residencia === null ) {
				throw new Error( `No existe ninguna residencia con ID "${ idResidencia }"` );
			}

			this.residenciaParaMostrar = residencia;

			this.detalleEsVisible = true;
		}
		/**
		 * Oculta detalla de la residencia
		 */
		public ocultarDetalle( ): void {
			this.detalleEsVisible = false;
			this.residenciaParaMostrar = null;
		}
		/**
		 * Muestra el formulario de modificación de residencias para la residencia con un ID dado.
		 */
		public  mostrarFormularioDeModificacion( idResidencia: string ): void {
			const residencia: Residencia | null = this.$store.getters.residenciaConId( idResidencia );

			if ( residencia === null ) {
				throw new Error( `No existe ninguna residencia con ID "${ idResidencia }"` );
			}

			this.residenciaParaModificar = residencia;

			this.formularioDeModificacionEsVisible = true;
		}

		/**
		 * Oculta el formulario de modificación de residencias.
		 */
		public ocultarFormularioDeModificacion( ): void {
			this.formularioDeModificacionEsVisible = false;
			this.residenciaParaModificar = null;
		}

		public generarRuta( idResidencia: string ): object {
			return {
				name: 'residencia con id',
				params: {
					idResidencia
				}
			};
		}
	}
</script>