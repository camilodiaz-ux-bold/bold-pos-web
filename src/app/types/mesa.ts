/**
 * Mesa — tipo canónico de la vista Grid (config + estado operativo ligero).
 * gridIndex determina el orden de aparición en MesasGridView y GestionarMesasGrid.
 */
export interface Mesa {
  id:              string;
  nombre:          string;
  zona:            string;
  capacidad:       number;
  habilitada:      boolean;
  estado:          'disponible' | 'ocupada' | 'cuenta_solicitada';
  gridIndex:       number;
  personas:        number;
  tiempoOcupacion: string;
  totalPedido?:    number;
}
