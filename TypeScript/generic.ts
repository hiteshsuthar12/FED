function genericfun<T>(item:T):T{
    return item;
}

console.log(genericfun<string>('HITESH_generic'));

console.log(genericfun<number>(55555));