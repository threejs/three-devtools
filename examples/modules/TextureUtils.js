import {Cache, CubeTexture, EventDispatcher, GammaEncoding, NearestFilter, RGBEEncoding, TextureLoader} from '../../web_modules/three.js';

import EquirectangularToCubeGenerator from './EquirectangularToCubeGenerator.js';
import { PMREMCubeUVPacker } from '../../web_modules/three/examples/jsm/pmrem/PMREMCubeUVPacker.js';
import { PMREMGenerator } from '../../web_modules/three/examples/jsm/pmrem/PMREMGenerator.js';
import RGBELoader from './RGBELoader.js';

const loader = new RGBELoader();

export default (async (renderer, url) => {
  const texture = await new Promise(resolve => loader.load(url, resolve));
  texture.encoding = RGBEEncoding;
  texture.minFilter = NearestFilter;
  texture.magFilter = NearestFilter;
  texture.flipY = true;

  const cubemapGenerator = new EquirectangularToCubeGenerator(texture, {
    resolution: 1024,
  });
  const cubemapTexture = cubemapGenerator.update(renderer);
  const pmremGenerator = new PMREMGenerator(cubemapTexture);
  pmremGenerator.update(renderer);
  const pmremPacker = new PMREMCubeUVPacker(pmremGenerator.cubeLods);
  pmremPacker.update(renderer);

  texture.dispose();
  pmremGenerator.dispose();
  pmremPacker.dispose();

  return pmremPacker.CubeUVRenderTarget.texture;
});
