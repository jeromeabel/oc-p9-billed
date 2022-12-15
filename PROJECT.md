# PROJECT

## TODO
- [x] Installer le Back-End (README)
- [x] Installer le Front-End (README)
- [x] Lire Doc Descriptions des fonctionnalités
- [ ] Lire Description pratique des besoins (+ rapport + plans de tests)
- [ ] Bugs 1 - report  : Kanban / Jest / Debugger
- [ ] Bugs 2 - hunt : parcours employés / Kanban / Debugger 
- [ ] Tests unitaires & intégration > 80%: fichiers Bill et NewBill. S'inspirer des tests Login et Dashboard RH, rapports de tests coverage
- [ ] Tests E2E : rédiger un plan de tests, s'inspirer du parcours admin RH

## DONE
- __tests__/Bills.js :  const datesSorted = [...dates].sort( (a,b) => b - a )
- __tests__/Logins.js > containers/Logins line 42 querySelector(`input[data-testid="admin-email-input"]`) instead of employee-email-input
- containers/NewBills.js > handleChangeFile : fileType + fileUrl (accept=".png, .jpg, .jpeg")
- containers/Dashboards.js > handleEditTicket : counter, extraction de l'affichage

## Run
- Back : npm run dev
- Front : live-server, npm run test

## Resources
- JEST : https://jestjs.io/docs/getting-started
- https://openclassrooms.com/fr/courses/3504461-testez-linterface-de-votre-site 4h
- https://openclassrooms.com/fr/courses/7159296-deboguez-l-interface-de-votre-site-internet 10h
- https://openclassrooms.com/fr/courses/7159306-testez-vos-applications-front-end-avec-javascript 10h
- https://openclassrooms.com/fr/courses/7008001-debutez-avec-react 8h
- partie 3 : https://openclassrooms.com/fr/courses/7150606-creez-une-application-react-complete
- https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file

## Project resources 
- Pdf : Descriptions des fonctionnalités
- Pdf : Description pratique des besoins
- Rapport : https://www.notion.so/a7a612fc166747e78d95aa38106a55ec?v=2a8d3553379c4366b6f66490ab8f0b90
- DocX : Exemple de plans de tests
- Chrome Debugger

## Livrables 
- Nom_Prénom_1_code_mmaaaa.txt : lien vers le code ;
- Nom_Prénom_2_rapport_test_mmaaaa.png : screenshot du rapport de tests Jest sur l’ensemble des fichiers d’UI (src/views) et des fichiers d’UX (src/containers) ;
- Nom_Prénom_3_rapport_couverture_mmaaaa.png : screenshot du rapport de couverture Jest ;
- Nom_Prénom_4_plan_test_mmaaaa.pdf : plan de tests End-To-End pour le parcours employé.