export default (() => {
return {
  hideObjectFromTools: (object) => {
    object.userData.fromDevtools = true;
  },

  isHiddenFromTools: (object) => {
    return !!(object.userData && object.userData.fromDevtools);
  },

  cacheEntitiesInScene: (scene, map) => {  
    map.set(scene.uuid, scene);

    scene.traverse(o => {
      map.set(o.uuid, o);
      if (o.material && o.material.uuid) {
        const materials = [].concat(o.material);
        for (let material of materials) {
          map.set(material.uuid, material);
          for (let key of Object.keys(material)) {
            const value = material[key];
            if (value && value.isTexture) {
              map.set(value.uuid, value);
              if (value.image && value.image.uuid) {
                map.set(value.image.uuid, value.image);
              }
            }
          }
        }
      }
      if (o.geometry && o.geometry.uuid) {
        map.set(o.geometry.uuid, o.geometry);
      }
    });
  },

  mergeResources(output, ...sceneResources) {
    ['materials', 'images', 'geometries', 'textures'].forEach(prop => {
      for (let resources of sceneResources) {
        if (!Array.isArray(output[prop])) {
          output[prop] = [];
        }
        const newEntities = sceneResources[prop] 
        const savedEntities = output[prop] 
        if (!Array.isArray(newEntities) || !newEntities || !newEntities.length) {
          return output;
        }
        output[prop] = savedEntities.push(...newEntities);
      }

      let uuids = [];
      output[prop] = output[prop].filter(entity => {
        if (uuids.indexOf(entity.uuid) !== -1) {
          return false;
        }
        uuids.push(entity.uuid);
        return true;
      });
    });
  },

  /**
   * This turns a Three entity into something serializable.
   * Mostly the built-in 'toJSON()' method with cached metadata.
   */
  serializeEntity: (entity, meta) => {
    let json;

    try {
      //console.time('toJSON-'+entity.uuid);
      json = meta ? entity.toJSON(meta) : entity.toJSON();
      //console.timeEnd('toJSON-'+entity.uuid);
    } catch (e) {
      // If this throws, it could be because of some object not being serializable.
      // @TODO handle this, throw it for now.
      console.error(entity.uuid + ' does not appear to be serializable.', e);
    }
    // Attach 'typeHint' here since we lose this information
    // over the wire.
    // Or is this redundant with the toJSON metadata?
    const typeHint = entity.isObject3D ? 'object' :
                     entity.isMaterial ? 'material' :
                     entity.isTexture ? 'texture' :
                     entity.isImage ? 'image' :
                     entity.isGeometry ? 'geometry' :
                     entity.isBufferGeometry ? 'geometry' :
                     entity.isShape ? 'shape' : 'unknown';

    if (json.geometries) {
      json.geometries.forEach(geometry => geometry.typeHint = 'geometry');
    }
    if (json.materials) {
      json.materials.forEach(material => material.typeHint = 'material');
    }
    if (json.textures) {
      json.textures.forEach(texture => texture.typeHint = 'texture');
    }
    if (json.images) {
      json.images.forEach(texture => texture.typeHint = 'image');
    }
    if (json.shapes) {
      json.shapes.forEach(texture => texture.typeHint = 'shape');
    }
    if (json.object) {
      json.object.typeHint = meta ? 'object' : 'scene';
      if (json.object.children) {
        let children = [...json.object.children];
        while (children.length) {
          let child = children.shift();
          child.typeHint = 'object';
          if (child.children) {
            children.push(...child.children);
          }
        }
      }
    } else {
      json.typeHint = typeHint;
    }

    return json;
  },
}
});
