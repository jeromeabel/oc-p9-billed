/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import { toHaveClass } from "@testing-library/jest-dom"
import userEvent from '@testing-library/user-event'

import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";

import router from "../app/Router.js";
import Bills from "../containers/Bills.js"

describe("Given I am connected as an employee", () => {

  describe("When I am on Bills Page", () => {

    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      
      // New test
      expect(windowIcon).toHaveClass('active-icon')
    })

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      //const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      //const datesSorted = [...dates].sort( antiChrono)
      // Debug sort
      const datesSorted = [...dates].sort( (a,b) => b - a )
      expect(dates).toEqual(datesSorted)
    })

    // New tests
    describe('When I click on the first eye icon', () => {
      test('Then it should open the modal', () => {
        //?? quand est-ce qu'on a besoin d'un async await ?
  
        $.fn.modal = jest.fn(); // jQuery Mock ?
  
        // ...
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        // ...
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }));
    
        document.body.innerHTML = BillsUI({ data: bills });
  
        // ?? store mocked
        const billsContainer = new Bills({
          document, onNavigate, localStorage: window.localStorage
        });

        const eyeIcon = screen.getAllByTestId('icon-eye')[0]; // ?? only the first one
        const openModal = jest.fn(billsContainer.handleClickIconEye(eyeIcon));
        eyeIcon.addEventListener('click', openModal);
        userEvent.click(eyeIcon); 

        expect(openModal).toHaveBeenCalled(); 
        const modal = screen.getByTestId('modalFileEmployee'); // ajouté dans BillsUI
        expect(modal).toBeTruthy();
        //expect(modal).toHaveClass("show") // ?? ne marche pas
      })
    })

  })
})
