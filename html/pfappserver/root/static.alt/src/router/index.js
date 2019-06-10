import Vue from 'vue'
import Router from 'vue-router'
import store from '@/store'

import LoginRoute from '@/views/Login/_router'
import StatusRoute from '@/views/Status/_router'
import ReportsRoute from '@/views/Reports/_router'
import AuditingRoute from '@/views/Auditing/_router'
import NodesRoute from '@/views/Nodes/_router'
import UsersRoute from '@/views/Users/_router'
import ConfigurationRoute from '@/views/Configuration/_router'

Vue.use(Router)

const DefaultRoute = {
  path: '*',
  redirect: '/status/dashboard'
}

let router = new Router({
  routes: [
    LoginRoute,
    StatusRoute,
    ReportsRoute,
    AuditingRoute,
    NodesRoute,
    UsersRoute,
    ConfigurationRoute,
    DefaultRoute
  ]
})

router.beforeEach((to, from, next) => {
  /**
  * 1. Check if a matching route defines a transition delay
  * 2. Hide the document scrollbar during the transition (see bootstrap/scss/_modal.scss)
  */
  let transitionRoute = from.matched.find(route => {
    return route.meta.transitionDelay // [1]
  })
  if (transitionRoute) {
    document.body.classList.add('modal-open') // [2]
  }
  /**
   * 3. Session token loaded from local storage
   * 4. No token -- go back to login page
   */
  if (to.name !== 'login') {
    store.dispatch('session/load').then(() => {
      next() // [3]
    }).catch(() => {
      router.push({ name: 'login' }) // [4]
      next()
    })
  } else {
    next()
  }
})

router.afterEach((to, from) => {
  /**
  * 1. Check if a matching route defines a transition delay
  * 2. Restore the document scrollbar after the transition delay
  * 3. Scroll to top of the page
  */
  let transitionRoute = from.matched.find(route => {
    return route.meta.transitionDelay // [1]
  })
  if (transitionRoute) {
    setTimeout(() => {
      document.body.classList.remove('modal-open') // [2]
      window.scrollTo(0, 0) // [3]
    }, transitionRoute.meta.transitionDelay)
  }
  /**
   * Fetch data required for ALL authenticated pages
   */
  if (store.state.session.username) {
    if (store.state.system.summary === false) {
      store.dispatch('system/getSummary')
    }
  }
})

export default router
