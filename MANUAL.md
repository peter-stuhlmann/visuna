## Seitenelement registrieren

### 1. Card für Seitenelement anlegen

Wird auf Seite "Neues Seitenelement hinzufügen" gezeigt.

Wo? ./data/content-elements-metadata.ts

### 2. Backend-Felder definieren

Wo? ./app/(backend)/workspaces/[id]/seiten/[pageId]/seitenelemente/[pageElementId]/utils/elementConfig.ts

### 3. PageElement in den FE-Output-Wrapper einbauen

Wo? ./app/[locale]/[slug]/page.tsx

### 4. Default-Werte setzen

Wo? ./data/page-elements-defaults.ts

### 5. Ggf. bisher nirgends genutzte Props hinzufügen

Wo? ./app/[locale]/[slug]/utils/getPageElementProps.tsx
