export const transformI18n = (i18nObject: any) => {
  const newObject = {} as any

  for (const [key, value] of Object.entries(i18nObject) as any) {
    const paramMatches = value.match(/\${(\d+)}/g)

    if (paramMatches) {
      const paramsCount = paramMatches.length
      const params = Array.from({ length: paramsCount }, (_, i) => `arg${i}`)
      const functionBody = `return \`${value.replace(/\${(\d+)}/g, (_: any, i: any) => '${arg' + i + '}')}\``
      newObject[key] = new Function(...params, functionBody)
    } else {
      newObject[key] = value
    }
  }

  return newObject
}
