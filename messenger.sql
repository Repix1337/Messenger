-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Maj 21, 2024 at 07:00 PM
-- Wersja serwera: 10.4.32-MariaDB
-- Wersja PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `messenger`
--

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `login` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `login`, `password`) VALUES
(1, 'Sigma', '$2y$10$FISP.BrmVrMhvTUuNFc74O1G5540VZAuS//83BmJxyuy3r68cbuoK'),
(5, 'Repix', '$2y$10$9kTTsocObYoqIYiKTN6ih.TkKPtPurqdW5vXSxa8ishOqKHDBma7y'),
(6, 'Witek', '$2y$10$IQ366hjVykUbCyPp5G1hyerSprCZ3SpcMslfieuQIJUDhejGeVgR2'),
(7, 'siema', '$2y$10$R6bBpQsoKtbGAm6EO/sImOPvqiVPNuKbgGazhjSDGUjyZJR3q9pGa'),
(8, 'sigma123', '$2y$10$gEqQcfd7b/baVG2Swx2gSu5Jcinr2xH6SjkUR5HJg/DkBaVBiN8CC'),
(9, 'sigma1233', '$2y$10$sbtNpbuOd9c1tpWKQLVoyeWGbREedACSkqPUSj8bGAWy3Z9OV51F.'),
(10, 'rel', '$2y$10$hdeMckWaqf9LlPIQ6ns3J.RnSvcoFEhbAetboiFLCER22YsFYkFvW'),
(11, 'Pedal', '$2y$10$s0DkZvph3JS2f8ejcKsfVu7P6/jEbF93RmK.C9yNhP5ozKcSvLSY6'),
(12, 'oskar', '$2y$10$hgn6fhivQ10au6RXW0T3gevZKwqN6VsG0p679nVcsNlrYBwKcDNoK');

--
-- Indeksy dla zrzutów tabel
--

--
-- Indeksy dla tabeli `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
