import {
  BuildArchitectures,
  OUTPUT_DIR,
} from "../../../src/types/package-config.ts";
import { runPackageAction } from "../../../src/packages.ts";

import { resolve, join } from "node:path";
import { argv } from "node:process";

export const builds = (cwd: string = process.cwd()): BuildArchitectures => {
  const toolchain = resolve(cwd, "../../toolchains/llvm-mingw");
  const CLANG = join(toolchain, "bin/clang.exe").replace(/\\/g, "/");
  const CLANGXX = join(toolchain, "bin/clang++.exe").replace(/\\/g, "/");
  const WINDRES = join(toolchain, "bin/llvm-windres.exe").replace(/\\/g, "/");
  const AARCH64_WINDRES = join(
    toolchain,
    "bin/aarch64-w64-mingw32-windres.exe"
  ).replace(/\\/g, "/");

  return {
    windows_x86_64: {
      configStep: `cmake -S . -B build/build-x86_64 -G Ninja \
      -DCMAKE_BUILD_TYPE=Release \
      -DGLM_BUILD_TESTS=OFF \
      -DBUILD_SHARED_LIBS=OFF \
      -DCMAKE_C_COMPILER=${CLANG} \
      -DCMAKE_CXX_COMPILER=${CLANGXX} \
      -DCMAKE_RC_COMPILER=${WINDRES} \
      -DCMAKE_C_COMPILER_TARGET=x86_64-w64-windows-gnu \
      -DCMAKE_CXX_COMPILER_TARGET=x86_64-w64-windows-gnu \
      -DCMAKE_SYSTEM_NAME=Windows \
      -DCMAKE_SYSTEM_PROCESSOR=x86_64 \
      -DCMAKE_INSTALL_PREFIX=${OUTPUT_DIR}/windows/x86_64/glm
    `,

      buildStep: `cmake --build build/build-x86_64 -j`,
      installStep: `cmake --install build/build-x86_64`,
    },
    windows_aarch64: {
      configStep: `cmake -S . -B build/build-aarch64 -G Ninja \
      -DCMAKE_BUILD_TYPE=Release \
      -DGLM_BUILD_TESTS=OFF \
      -DBUILD_SHARED_LIBS=OFF \
      -DCMAKE_C_COMPILER=${CLANG} \
      -DCMAKE_CXX_COMPILER=${CLANGXX} \
      -DCMAKE_RC_COMPILER=${AARCH64_WINDRES} \
      -DCMAKE_RC_FLAGS=--target=aarch64-w64-mingw32 \
      -DCMAKE_C_COMPILER_TARGET=aarch64-w64-windows-gnu \
      -DCMAKE_CXX_COMPILER_TARGET=aarch64-w64-windows-gnu \
      -DCMAKE_SYSTEM_NAME=Windows \
      -DCMAKE_SYSTEM_PROCESSOR=aarch64 \
      -DCMAKE_INSTALL_PREFIX=${OUTPUT_DIR}/windows/aarch64/glm
      `,
      buildStep: `cmake --build build/build-aarch64 -j`,
      installStep: `cmake --install build/build-aarch64`,
    },
  } satisfies BuildArchitectures;
};

const args = argv.slice(2);
const [action = "help"] = args;

await runPackageAction(action, process.cwd(), builds());
