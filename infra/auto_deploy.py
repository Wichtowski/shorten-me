import pulumi.automation as auto

def pulumi_program():
    # You can import your __main__.py logic here or inline it
    import infra.__main__

# Create or select a stack
stack = auto.create_or_select_stack(
    stack_name="dev",
    project_name="infra",
    program=pulumi_program
)

# Set config, secrets, etc. if needed
stack.set_config("azure-native:location", auto.ConfigValue(value="northeurope"))

# Deploy!
up_res = stack.up(on_output=print)
print("Outputs:", up_res.outputs)