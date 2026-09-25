// Tiny CLI: hash a password with the same argon2id settings the API uses,
// then print an UPDATE statement you can paste into MySQL.
//
// Usage:
//   cargo run --bin hash_password -- 'your-password' [admin@email.com]

use argon2::{
    password_hash::{rand_core::OsRng, PasswordHasher, SaltString},
    Argon2,
};
use std::env;
use std::process;

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 || args.len() > 3 {
        eprintln!("Usage: cargo run --bin hash_password -- <password> [email]");
        eprintln!("Example: cargo run --bin hash_password -- 'MyS3cret!' admin@drtapan.com");
        process::exit(1);
    }

    let password = &args[1];
    let email = args.get(2).cloned().unwrap_or_else(|| "admin@drtapan.com".to_string());

    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let hash = argon2
        .hash_password(password.as_bytes(), &salt)
        .expect("failed to hash password")
        .to_string();

    // Escape single quotes for SQL safety
    let safe_email = email.replace('\'', "''");
    let safe_hash = hash.replace('\'', "''");

    println!("\n-- Argon2id hash generated for {}", email);
    println!("-- Run this against your MySQL DB:\n");
    println!(
        "UPDATE admin_users SET password_hash = '{}', is_active = TRUE WHERE email = '{}';",
        safe_hash, safe_email
    );
    println!();
}
