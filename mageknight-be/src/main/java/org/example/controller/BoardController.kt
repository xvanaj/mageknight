package org.example.controller

import org.example.domain.Board
import org.springframework.http.CacheControl
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController


@RestController
@CrossOrigin(origins = ["http://localhost:3000"]) // Adjust the origin as needed
class BoardController {

    @GetMapping("/api/board")
    fun getBoard(): ResponseEntity<Board> {
        val board = Board()
        return ResponseEntity.ok()
            .cacheControl(CacheControl.noCache())
            .body(board)
    }
}