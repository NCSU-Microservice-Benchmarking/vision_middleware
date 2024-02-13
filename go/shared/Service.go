package service

import (
	"crypto/tls"
	"fmt"
	"net/http"
	"os"

	"github.com/NCSU-Microservice-Benchmarking/vision_middleware/go/shared/kafka"
	"github.com/NCSU-Microservice-Benchmarking/vision_middleware/go/shared/types"
	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

type Service struct {
	Metadata types.ServiceMetadata
	App      *mux.Router
	Port     int
	Server   *http.Server
	Producer *kafka.Producer
	Consumer *kafka.Consumer
}

func NewService(config types.ServiceConfig, metadata types.ServiceMetadata) *Service {
	s := &Service{
		Metadata: metadata,
		Port:     config.Port,
	}

	s.App = mux.NewRouter()
	s.configureMiddlewares()
	s.configureRoutes()
	s.configureKafka(config.KafkaOptions)
	s.configureRedis()
	s.createServer(config)

	return s
}

func (s *Service) configureMiddlewares() {
	s.App.Use(cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"},
		AllowedHeaders:   []string{"X-Requested-With", "content-type"},
		AllowCredentials: true,
	}).Handler)
	s.App.Use(mux.CORSMethodMiddleware(s.App))
	s.App.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			fmt.Println("Logging middleware:", r.RequestURI)
			next.ServeHTTP(w, r)
		})
	})
}

func (s *Service) configureRoutes() {
	// Define your routes here using s.App
}

func (s *Service) configureKafka(kafkaOptions types.KafkaOptions) error {
	var err error // Define err variable here

	if kafkaOptions.Topics.Producer != "" {
		s.Producer, err = kafka.NewProducer(s.Metadata.Name, kafkaOptions)
		if err != nil {
			return err // Return error if producer creation fails
		}
	}

	// Then, define the producerCallback function using the same signature as ProducerCallback
	producerCallback := func(request types.Request, topic string) error {
		// Call the Producer's Send method
		return s.Producer.Send(request)
	}

	// Create the consumer with the correct callback
	s.Consumer, err = kafka.NewConsumer(s.Metadata.Name, kafkaOptions, producerCallback)
	if err != nil {
		return err // Return error if consumer creation fails
	}

	// No errors occurred, return nil
	return nil
}

func (s *Service) configureRedis() {
	// Implement Redis configuration if needed
}

func (s *Service) createServer(config types.ServiceConfig) {
	if config.SSL != nil && os.Getenv("NODE_ENV") != "production" && os.Getenv("DOCKER") != "true" {
		httpsOptions := &tls.Config{
			MinVersion: tls.VersionTLS12,
			CurvePreferences: []tls.CurveID{
				tls.CurveP521,
				tls.CurveP384,
				tls.CurveP256,
			},
		}

		s.Server = &http.Server{
			Addr:      fmt.Sprintf(":%d", s.Port),
			Handler:   s.App,
			TLSConfig: httpsOptions,
		}
	} else {
		s.Server = &http.Server{
			Addr:    fmt.Sprintf(":%d", s.Port),
			Handler: s.App,
		}
	}
}

func (s *Service) Start() error {
	fmt.Printf("%s service listening on port %d\n", s.Metadata.Name, s.Port)

	if s.Producer != nil {
		if err := s.Producer.Start(); err != nil {
			return err
		}
	}

	if err := s.Consumer.Start(); err != nil {
		return err
	}

	return s.Server.ListenAndServe()
}

func (s *Service) Stop() error {
	if err := s.Server.Close(); err != nil {
		return err
	}

	if s.Producer != nil {
		if err := s.Producer.Shutdown(); err != nil {
			return err
		}
	}

	if err := s.Consumer.Shutdown(); err != nil {
		return err
	}

	// Stop Redis here if needed

	return nil
}
