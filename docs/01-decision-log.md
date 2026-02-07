# 📋 Decision Log

Este documento registra **todas** las decisiones técnicas significativas del proyecto, incluyendo el contexto, las alternativas evaluadas, y los trade-offs aceptados.

---

## Formato de Decisiones

Cada decisión sigue esta estructura:
- **ID**: Número único y correlativo
- **Fecha**: Cuando se tomó la decisión
- **Estado**: Propuesta / Aceptada / Rechazada / Superseded
- **Contexto**: Situación que requiere la decisión
- **Decisión**: Qué se decidió
- **Alternativas evaluadas**: Qué más se consideró
- **Consecuencias**: Impacto positivo y negativo
- **Notas**: Información adicional relevante

---

## DECISIÓN #001: Framework de UI Testing

**📅 Fecha:** 2026-02-07  
**👤 Responsable:** Diego de Juan  
**📊 Estado:** ✅ Aceptada

---

### 🎯 Contexto

El proyecto `qa-ecommerce-showcase` requiere un framework de testing automatizado para validar la UI de una aplicación e-commerce moderna que será desplegada en Hostinger.

**Requisitos técnicos:**
- Cross-browser testing (Chrome, Firefox, Safari)
- Ejecución headless para integración con CI/CD
- Captura automática de screenshots/videos en caso de fallos
- Soporte robusto para TypeScript
- Ejecución paralela de tests
- Auto-waiting de elementos
- Comunidad activa y documentación de calidad

**Restricciones:**
- Presupuesto: $0 (herramientas open source únicamente)
- Equipo: 1 persona (yo)
- Timeline: 6 meses para framework completo
- Experiencia previa: Nivel intermedio con Playwright

---

### ✅ Decisión

**Elegido:** Playwright con TypeScript

**Razón principal:**  
Priorizar el dominio profundo de una herramienta moderna antes que conocimiento superficial de múltiples frameworks. Playwright cumple todos los requisitos técnicos del proyecto y aprovechar mi experiencia previa me permitirá enfocarme en patrones avanzados y arquitectura de testing en lugar de aprender sintaxis básica.

---

### 🔍 Alternativas Evaluadas

#### **Opción A: Cypress**
**Pros:**
- Developer experience superior (UI intuitiva, debugging excelente)
- Comunidad más grande y madura
- Documentación y ejemplos abundantes
- Time-travel debugging único
- Ejecución más rápida en algunos escenarios

**Contras:**
- Soporte limitado de Safari (solo via WebKit experimental)
- Arquitectura de ejecución dentro del navegador limita algunos casos de uso
- Auto-waiting menos robusto que Playwright en casos edge
- Requeriría aprender nueva sintaxis y paradigmas

**Razón de descarte:**  
Aunque Cypress tiene ventajas claras en DX, este proyecto es una oportunidad para dominar Playwright a nivel avanzado. Aprender Cypress quedará para un proyecto futuro cuando ya tenga expertise profundo en Playwright.

---

#### **Opción B: Selenium WebDriver**
**Pros:**
- Estándar de industria con 20+ años
- Soporte máximo de navegadores (incluyendo legacy)
- Comunidad gigantesca
- Bindings en múltiples lenguajes

**Contras:**
- Arquitectura antigua (protocolo W3C WebDriver)
- No tiene auto-waiting nativo (requiere esperas explícitas/implícitas)
- Setup más complejo
- Menor velocidad de ejecución
- TypeScript no es ciudadano de primera clase

**Razón de descarte:**  
Selenium es robusto pero su arquitectura antigua y falta de features modernas (auto-waiting, screenshots/videos nativos) lo hacen menos adecuado para un proyecto showcase en 2026. No aporta valor diferencial en mi portfolio.

---

### ⚖️ Consecuencias

#### **Positivas:**
✅ **Profundidad sobre amplitud** - Podré explorar patrones avanzados (fixtures personalizados, custom matchers, optimización de performance)  
✅ **Aprovechamiento de conocimiento previo** - Curva de aprendizaje reducida me permite enfocar en arquitectura y diseño  
✅ **Cross-browser robusto** - Soporte nativo de Safari sin configuraciones complejas  
✅ **TypeScript first-class** - Tipos fuertes mejoran mantenibilidad  
✅ **Auto-waiting inteligente** - Reduce tests flaky  
✅ **Ecosistema moderno** - Herramientas complementarias (Playwright Test, Trace Viewer, Codegen)

#### **Negativas / Trade-offs aceptados:**
❌ **Riesgo de encasillamiento** - No explorar Cypress limita mi conocimiento del mercado  
❌ **Comunidad menor** - Menos Stack Overflow answers y tutoriales que Cypress  
❌ **Menor diferenciación** - Ya tengo experiencia con Playwright, no demuestro capacidad de aprender nuevas herramientas

#### **Mitigación de riesgos:**
- 📚 Estudiaré documentación de Cypress para entender diferencias conceptuales
- 🎯 Incluiré en mi README una sección "¿Por qué Playwright vs Cypress?" para demostrar conocimiento de ambas
- 🔄 Proyecto futuro dedicado exclusivamente a Cypress (roadmap mes 5-6)

---

### 📚 Documentación de Referencia

**Research completo:** [docs/research-ui-framework.md](./research-ui-framework.md)

**Fuentes consultadas:**
- [Playwright Docs](https://playwright.dev/)
- [Cypress Docs](https://www.cypress.io/)
- [Comparativa Playwright vs Cypress 2024](https://www.lambdatest.com/blog/playwright-vs-cypress/)
- [State of JS 2024 - Testing Tools](https://stateofjs.com/en-us/)

---

### 💡 Aprendizajes

**Lo que me sorprendió durante la investigación:**
- Cypress tiene mejor DX de lo que pensaba (time-travel debugging es impresionante)
- Selenium sigue siendo muy usado pero principalmente en empresas con código legacy
- Playwright ha crecido muy rápido en adopción (2020 → 2026)

**Pregunta abierta para el futuro:**
- ¿Cómo se comporta Playwright en escenarios con Shadow DOM complejo o iframes anidados? (probar en casos reales del proyecto)

**Si tuviera que volver a decidir:**
- Elegiría igual, pero dedicaría 1 día a hacer un "Hello World" en Cypress para tener contexto práctico de la diferencia en DX

---

### 🔄 Seguimiento

**Criterios de éxito:**
- [ ] Framework de Playwright configurado y funcionando en <1 semana
- [ ] Primer suite de tests (login, browse, checkout) en <2 semanas
- [ ] CI/CD integrado con ejecución paralela en <3 semanas
- [ ] Zero tests flaky en suite completa en <1 mes

**Señales de que la decisión fue incorrecta:**
- Tiempo excesivo debuggeando issues específicos de Playwright
- Limitaciones técnicas que Cypress resolvería mejor
- Frustración con el ecosistema

**Plan B:**
Si en 1 mes los criterios de éxito no se cumplen, re-evaluar y considerar migrar a Cypress (poco probable dado mi experiencia previa).

---

### ✍️ Notas Adicionales

Esta es mi primera decisión técnica documentada profesionalmente. El objetivo no es solo elegir la herramienta "correcta", sino demostrar **proceso de pensamiento estructurado** y **criterio técnico**.

**Para futuros reclutadores/entrevistadores:**  
Sí, podría haber elegido Cypress y sería igualmente válido. La clave no es la herramienta, sino la capacidad de justificar la decisión con contexto, datos y consciencia de trade-offs.

---

**Última actualización:** 2026-02-07