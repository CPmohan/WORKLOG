package main

import (
    "database/sql"
    "encoding/json"
    "log"
    "net/http"

    _ "github.com/go-sql-driver/mysql"
)

func main() {
    db, err := sql.Open("mysql", "root:Zeb2001@cp@tcp(127.0.0.1:3306)/myapp")
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()

    http.HandleFunc("/users", func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "application/json")
        w.Header().Set("Access-Control-Allow-Origin", "*") // CORS

        rows, err := db.Query("SELECT first_name FROM users")
        if err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
        defer rows.Close()

        var names []string
        for rows.Next() {
            var name string
            if err := rows.Scan(&name); err != nil {
                http.Error(w, err.Error(), http.StatusInternalServerError)
                return
            }
            names = append(names, name)
        }

        json.NewEncoder(w).Encode(names)
    })

    log.Println("Server running on http://localhost:8080")
    http.ListenAndServe(":8080", nil)
}
