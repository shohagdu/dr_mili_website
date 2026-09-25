# ============================================================
# Build stage
# ============================================================
FROM rust:1.82-slim AS builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Cache deps separately for faster rebuilds
COPY Cargo.toml Cargo.lock* ./
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release && rm -rf src

# Build the real app
COPY src ./src
COPY migrations ./migrations
RUN touch src/main.rs && cargo build --release

# ============================================================
# Runtime stage
# ============================================================
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/target/release/drtapan-api /app/drtapan-api
COPY --from=builder /app/migrations /app/migrations

EXPOSE 8080

CMD ["/app/drtapan-api"]
