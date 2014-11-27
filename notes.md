## JSDoc

### JSDoc generation

```
./node_modules/.bin/jsdoc -r calligraphy canvasplayground ui -d jsdoc
```

### JSDoc notes

JSDoc doesn't support `@inheritDoc` and `@override` tags (<https://github.com/jsdoc3/jsdoc/issues/53>) yet.
It renders the HTML correctly getting the doc from the super class without these tags. Actually, when I add one of them, inheriting document doesn't work anymore.

However, Intellij doesn't support document inheritance. Thus, I needed to add `@see` tags as a first comment in the method body.