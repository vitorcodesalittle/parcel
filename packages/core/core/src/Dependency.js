// @flow
import type {
  SourceLocation,
  Meta,
  DependencySpecifier,
  Symbol,
} from '@parcel/types';
import type {Dependency, Environment, Target} from './types';
import {hashString} from '@parcel/hash';
import {SpecifierType, Priority} from './types';

type DependencyOpts = {|
  id?: string,
  sourcePath?: string,
  sourceAssetId?: string,
  specifier: DependencySpecifier,
  specifierType: $Keys<typeof SpecifierType>,
  priority?: $Keys<typeof Priority>,
  needsStableName?: boolean,
  isEntry?: boolean,
  isOptional?: boolean,
  loc?: SourceLocation,
  env: Environment,
  meta?: Meta,
  resolveFrom?: string,
  target?: Target,
  symbols?: Map<
    Symbol,
    {|local: Symbol, loc: ?SourceLocation, isWeak: boolean, meta?: ?Meta|},
  >,
  pipeline?: ?string,
|};

export function createDependency(opts: DependencyOpts): Dependency {
  let id =
    opts.id ||
    hashString(
      (opts.sourceAssetId ?? '') +
        opts.specifier +
        opts.env.id +
        (opts.target ? JSON.stringify(opts.target) : '') +
        (opts.pipeline ?? ''),
    );

  return {
    ...opts,
    id,
    specifierType: SpecifierType[opts.specifierType],
    priority: Priority[opts.priority ?? 'sync'],
    needsStableName: opts.needsStableName ?? false,
    isEntry: opts.isEntry ?? false,
    isOptional: opts.isOptional ?? false,
    meta: opts.meta || {},
    symbols: opts.symbols,
  };
}

export function mergeDependencies(a: Dependency, b: Dependency): void {
  let {meta, symbols, ...other} = b;
  Object.assign(a, other);
  Object.assign(a.meta, meta);
  if (a.symbols && symbols) {
    for (let [k, v] of symbols) {
      a.symbols.set(k, v);
    }
  }
}
