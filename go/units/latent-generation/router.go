package main

import (
	"net/http"

	"github.com/gorilla/mux"
)

func HealthCheckHandler(w http.ResponseWriter, r *http.Request) {

}

func SetupRouter() *mux.Router {
	router := mux.NewRouter()

	router.HandleFunc("/health-check", HealthCheckHandler).Methods("POST")

	return router
}
