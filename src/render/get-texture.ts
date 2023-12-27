import { Texture, TextureLoader } from "three";

const textures = new Map<string, Texture>();
const textureLoader = new TextureLoader();

export async function getTexture(path: string): Promise<Texture> {
  if (textures.has(path)) {
    return textures.get(path)!;
  }

  return new Promise<Texture>((resolve, reject) => {
    textureLoader.load(
      path,
      (texture) => {
        textures.set(path, texture);
        resolve(texture);
      },
      undefined,
      reject
    );
  });
}
