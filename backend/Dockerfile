FROM golang:1.21-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=1 GOOS=linux go build -a -installsuffix cgo -o shopcart-api main.go

FROM alpine:latest

WORKDIR /root/

COPY --from=builder /app/shopcart-api .

EXPOSE 8080

CMD ["./shopcart-api"]
