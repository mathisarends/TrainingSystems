import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mapProperty',
  standalone: true,
})
export class MapPropertyPipe<K, V> implements PipeTransform {
  /**
   * Transforms a Map by retrieving the value associated with the provided key.
   */
  transform(map: Map<K, V>, key: K): V | undefined {
    return map.get(key);
  }
}
