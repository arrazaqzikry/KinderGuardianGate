package com.example.security.kinderguardiangate.controller;

import com.example.security.kinderguardiangate.service.PickupService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
public class PickupController {
    private final PickupService pickupService;

    public PickupController(PickupService pickupService) {
        this.pickupService = pickupService;
    }

    @GetMapping("/")
    public String home() {
        return "index";
    }

    @PostMapping("/verify")
    public String verifyPickup(@RequestParam Long studentId,
                               @RequestParam String guardianIc,
                               Model model) {
        String result = pickupService.verifyPickup(studentId, guardianIc);
        model.addAttribute("result", result);
        return "index";
    }
}
