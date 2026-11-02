module.exports = {
  displayName: 'api-bff-e2e',
  testEnvironment: 'node',
  // Resolver do Nx lê os paths do tsconfig.base.json e resolve aliases como @nexus/common
  resolver: '@nx/jest/plugins/resolver',
  transform: {
    // ts-jest para arquivos TypeScript do projeto
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
    // babel-jest para arquivos .js (inclui pacotes ESM como @nestjs/jwt, @nestjs/passport)
    '^.+\\.js$': [
      'babel-jest',
      {
        presets: [
          ['@babel/preset-env', { targets: { node: 'current' }, modules: 'commonjs' }],
        ],
      },
    ],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  testMatch: ['<rootDir>/test/**/*.e2e-spec.ts'],
  coverageDirectory: '../../coverage/apps/api-bff-e2e',
  // Força Jest a usar a versão CommonJS de pacotes que exportam como ESM
  testEnvironmentOptions: {
    customExportConditions: ['node', 'require', 'default'],
  },
  // Padrão para IGNORAR (não transformar): tudo em node_modules que NÃO seja @nestjs/jwt ou @nestjs/passport
  // Compatível com estrutura pnpm onde o caminho real é node_modules/.pnpm/.../node_modules/@nestjs/...
  transformIgnorePatterns: [
    '^(?!.*node_modules/@nestjs/(jwt|passport)).*node_modules',
  ],
  // Cada spec sobe o servidor NestJS completo — timeout maior que unitários
  testTimeout: 30_000,
};
