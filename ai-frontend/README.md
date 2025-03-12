# XpresoAi

This repository contains two main components:

## Cross-Chain Lending
A blockchain-based lending platform that enables cross-chain lending operations.

## AI Frontend
An AI-powered frontend interface for enhanced user experience.

## Project Structure
- `/cross-chain-lending` - Contains the smart contracts and lending platform code
- `/ai-frontend` - Contains the AI-powered frontend application

JohnnyTime's Cario Smart Contract Hacking Course Part 1 Exercises Repository.

## Prerequisites

- Install [Scarb 2.8.1](https://docs.swmansion.com/scarb/download.html#preview-version)
  - Install [asdf](https://asdf-vm.com/guide/getting-started.html)
  - Add scarb plugin - `asdf plugin add scarb`
  - Install scarb 2.8.1 - `asdf install scarb 2.8.1`
  - Set as a global var version - `asdf global scarb 2.8.1`
- Install [Starknet-Foundry 0.24.0](https://github.com/foundry-rs/starknet-foundry)
  - Run - `curl -L https://raw.githubusercontent.com/foundry-rs/starknet-foundry/master/scripts/install.sh | sh`
  - Install version `0.26.0` | `snfoundryup -v 0.29.0`
- Install [Universal Sierra Compiler](https://github.com/software-mansion/universal-sierra-compiler)
  - Run - `curl -L https://raw.githubusercontent.com/software-mansion/universal-sierra-compiler/master/scripts/install.sh | sh`
  - Version: 2.2.0

## Getting started

- To run all tests, use the command `snforge test`.
- To run a specific test file, use the command `snforge test test_name_num`.

## Repository structure

- All the exercises are located in `src/exercises/`
  - The exercises are divided into 2 categories which exist in 2 separate folders: `cairo_crash_course` and `cairo_hacking`
  - Each exercise chapter is represented by a folder, such as `src/exercises/cairo_hacking/first_cairo_contract`.
  - Within each chapter folder, there are subfolders for individual exercises, labeled with the exercise number, e.g.: `src/exercises/cairo_hacking/first_cairo_contract/first_cairo_contract_1`.
- Every exercise includes a Cairo module file (e.g.: `src/exercises/cairo_hacking/first_cairo_contract/first_cairo_contract1.cairo`), which imports the test file and all associated code.
- Initially, the test file is commented out. When you begin working on the exercise, remember to **uncomment the code in the `.cairo` files in the exercise folder!**
  Test files are named in the format `test_name_num.cairo`.

## How to run exercise and complete the exercise

1. Uncomment all the code in the `.cairo` files in the exercise folder.
2. Complete all the TODOs in both the code and the test file.
3. To confirm whether your exercise is completed, run `snforge test exercise`.
   - For instance: `snforge test first_cairo_contract_1`.
   - It is also possible to run the test just with the name of the folder, for instance: `snforge test first_cairo_contract_1`.
4. If the test passes, then you have completed the exercise.

## Troubleshooting

### Error E0277

**Error:**
error[E0277]: the trait bound `[CodeMapping]: std::default::Default` is not satisfied

**Solution:**
Update rust by running the command `rustup update`.
