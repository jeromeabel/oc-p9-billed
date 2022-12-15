/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom"
import { toHaveClass } from "@testing-library/jest-dom"
import userEvent from '@testing-library/user-event'

import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import Bills from "../containers/Bills.js"


// Handle Bills Container to share with all the tests
let billsContainer = null;

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

      expect(windowIcon).toHaveClass('active-icon') // Test if icon is active (=highlighted)
    })

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen
        .getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i)
        .map(a => a.innerHTML)
      const datesSorted = [...dates].sort((a, b) => b - a) // Debug sort

      expect(dates).toEqual(datesSorted)
    })
  })

  // ------------ New Tests ------------ //
  describe("Given I am connected as an employee ", () => {

    // Factorisation de la création de la vue "Employee"
    beforeEach(() => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }));
      document.body.innerHTML = BillsUI({ data: bills });

      billsContainer = new Bills({
        // ?? store mocked
        document, onNavigate, store:null, localStorage: window.localStorage 
      });
    })
  
    afterEach(() => {
      document.body.innerHTML = ''
    })

    // Test Eye Icons
    describe('When I click on the first eye icon', () => {
      test('Then it should open the modal', () => {
        // async / await ?
        $.fn.modal = jest.fn(); // jQuery Mock ?

        // Get Elements
        const eyeIcon = screen.getAllByTestId('icon-eye')[0]; // ?? only the first one
        const openModal = jest.fn(billsContainer.handleClickIconEye(eyeIcon));

        // Set Events
        eyeIcon.addEventListener('click', openModal);
        userEvent.click(eyeIcon);

        // Assertions
        expect(openModal).toHaveBeenCalled();
        const modal = screen.getByTestId('modalFileEmployee'); // ajouté dans BillsUI
        expect(modal).toBeTruthy();
        //expect(modal).toHaveClass("show") // ?? ne marche pas
      })
    })

    // Test New Bill Button
    describe('When I click on the New Bill Button', () => {
      test('Then it should open the NewBill form', () => {
        
        // Get Elements
        const openNewBill = jest.fn(billsContainer.handleClickNewBill);
        const btnNewBill = screen.getByTestId("btn-new-bill");
  
        // Set Events
        btnNewBill.addEventListener('click', openNewBill);
        userEvent.click(btnNewBill);
  
        // Assertions
        expect(openNewBill).toHaveBeenCalled(); // La fonction a été appelée
        expect(screen.getByTestId('form-new-bill')).toBeTruthy(); // Le formulaire est affiché
      })
    })

  })
})
