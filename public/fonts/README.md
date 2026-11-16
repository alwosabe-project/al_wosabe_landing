# Alexandria web font

`Alexandria-400-800.woff2` retains the Alexandria family, Arabic and Latin glyphs, and the 400–800 weights used by the site. It replaces seven preloaded static TTFs. Original TTF sources remain for reference; they are no longer referenced or preloaded by the application.

Source retrieved on 2026-11-17: https://github.com/google/fonts/blob/main/ofl/alexandria/Alexandria%5Bwght%5D.ttf
License: [SIL Open Font License 1.1](OFL.txt), Alexandria Project Authors.

Source TTF SHA-256: `db8ae03b62d55a65aa4e04307878df8c00d6e5388e4800635cbe0e22b6411b64`
Output WOFF2 SHA-256: `0ee703f939edcff4b71db1597d5727822e500066ebe20af182996ff19306dc93`

Generated with FontTools 4.68.0 and Brotli 1.2.1:

```python
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
font = TTFont("Alexandria-variable.ttf")
font = instantiateVariableFont(font, {"wght": (400, 800)}, inplace=True)
font.flavor = "woff2"
font.save("Alexandria-400-800.woff2")
```
